const fs = require('fs');
const path = require('path');

/**
 * Express middleware to mute requests based on JSON rules
 * @param {string} configPath - optional path to rules.json
 * @returns {Function} - express middleware
 */
module.exports = function expressMute(configPath) {

    var filePath = path.resolve(configPath || './mute-rules/rules.json');
    var rules = [];

    // load rules from file
    try {
        var file = fs.readFileSync(filePath, 'utf8');
        rules = JSON.parse(file);
    }
    catch (err) {
        console.warn('[express-mute] no rules loaded from', filePath);
    }

    return function(req, res, next) {

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            // respond early if rule matches
            if (matchesRule(rule, req)) {
                return res.status(rule.status || 204).json(rule.response || {});
            }
        }

        // continue if no rule matched
        next();
    };
};

/**
 * Check if a rule matches the request
 * Only checks fields explicitly defined in the rule
 * @param {Object} rule - One rule from rules.json
 * @param {Object} req - Express request object
 * @returns {boolean} - True if the rule matches
 */
function matchesRule(rule, req) {

    // match method
    if (rule.method && rule.method.toLowerCase() !== req.method.toLowerCase()) return false;

    // match URL path
    if (rule.url && !matches(rule.url, req.path)) return false;

    var i;
    var key;
    var value;

    // match headers (only those defined in rule)
    if (rule.headers) {

        var headerKeys = Object.keys(rule.headers);

        for (i = 0; i < headerKeys.length; i++) {
            key = headerKeys[i];
            value = req.headers[key] || '';
            if (!matches(rule.headers[key], value)) return false;
        }
    }

    // match query parameters (support nested keys if value is JSON)
    if (rule.query) {

        var queryKeys = Object.keys(rule.query);

        for (i = 0; i < queryKeys.length; i++) {
            key = queryKeys[i];
            var expected = rule.query[key];

            // dot notation indicates nested matching
            if (key.indexOf('.') !== -1) {
                var rootKey = key.split('.')[0];
                var raw = req.query[rootKey];

                // try parse raw value if it's a string
                if (typeof raw === 'string') {
                    try {
                        var parsed = JSON.parse(raw);
                        value = getNestedValue(parsed, key.split('.').slice(1).join('.')) || '';
                    }
                    catch (e) {
                        return false;
                    }
                }
                else if (typeof raw === 'object') {
                    value = getNestedValue(raw, key.split('.').slice(1).join('.')) || '';
                }
                else {
                    return false;
                }
            }
            else {
                value = req.query[key] || '';
            }

            if (!matches(expected, value)) return false;
        }
    }

    // match body fields
    if (rule.body) {

        if (typeof req.body !== 'object' || req.body === null) return false;

        var bodyKeys = Object.keys(rule.body);
        var bodyItems = Array.isArray(req.body) ? req.body : [req.body];

        // must match ALL rule fields in ONE item
        var matchFound = bodyItems.some(function(item) {
            return bodyKeys.every(function(key) {
                var value = getNestedValue(item, key) || '';
                return matches(rule.body[key], value);
            });
        });

        if (!matchFound) return false;
    }

    return true;
}

/**
 * Compares a rule pattern against a request value
 * Supports regex if pattern is wrapped in slashes
 * @param {string} pattern - Pattern to match against (string or /regex/)
 * @param {string} value - Actual value from request
 * @returns {boolean} - True if pattern matches value
 */
function matches(pattern, value) {
    if (typeof pattern !== 'string' && typeof pattern !== 'boolean' && typeof pattern !== 'number') return false;

    // convert strings like "true", "false", "123" into proper types
    if (typeof value === 'string') {
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(value) && value.trim() !== '') value = Number(value);
    }

    if (typeof pattern === 'string') {
        // use regex if pattern is wrapped in slashes
        if (pattern[0] === '/' && pattern[pattern.length - 1] === '/') {
            var regex = new RegExp(pattern.slice(1, -1));
            return regex.test(String(value));
        }

        return pattern === String(value);
    }

    return pattern === value;
}

/**
 * Gets a nested value from an object using dot notation
 * @param {Object} obj - source object
 * @param {string} keyPath - key in dot notation (e.g. 'lib.version')
 * @returns {*} - value or undefined
 */
function getNestedValue(obj, keyPath) {
    var parts = keyPath.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
        if (current && typeof current === 'object') {
            current = current[parts[i]];
        }
        else {
            return undefined;
        }
    }
    return current;
}
