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

    // match query parameters
    if (rule.query) {
        var queryKeys = Object.keys(rule.query);
        for (i = 0; i < queryKeys.length; i++) {
            key = queryKeys[i];
            value = req.query[key] || '';
            if (!matches(rule.query[key], value)) return false;
        }
    }

    // match body fields
    if (rule.body && typeof req.body === 'object' && req.body !== null) {
        var bodyKeys = Object.keys(rule.body);
        for (i = 0; i < bodyKeys.length; i++) {
            key = bodyKeys[i];
            value = req.body[key] || '';
            if (!matches(rule.body[key], value)) return false;
        }
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
    if (typeof pattern !== 'string') return false;

    // use regex if pattern is wrapped in slashes
    if (pattern[0] === '/' && pattern[pattern.length - 1] === '/') {
        var regex = new RegExp(pattern.slice(1, -1));
        return regex.test(value);
    }

    return pattern === value;
}
