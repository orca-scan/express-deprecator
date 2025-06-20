const fs = require('fs');
const path = require('path');

/**
 * Express middleware that blocks requests based on JSON rules
 * @param {string} configPath - Optional path to the JSON rules file
 * @returns {Function} - Middleware function for Express
 */
module.exports = function expressMute(configPath) {

    var filePath = path.resolve(configPath || './mute-rules/rules.json');
    var rules = [];

    // try to load the rules from the file
    try {
        var file = fs.readFileSync(filePath, 'utf8');
        rules = JSON.parse(file);
    }
    catch (err) {
        console.warn('[express-mute] no rules loaded from', filePath);
    }

    /**
     * Express middleware handler
     * @param {Request} req - express Request object
     * @param {Response} res - express Response object
     * @param {function} next - express next method
     * @returns {Function} - Responds early if request matches any rule
     */
    return function(req, res, next) {

        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];

            // if rule does not match, skip to next
            if (!match(rule, req)) continue;

            // respond early if match found
            var status = rule.status || 204;
            return res.status(status).json(rule.response || {});
        }

        // pass to next middleware if no match
        next();
    };
};

/**
 * Checks if a rule matches the request
 * @param {Object} rule - Rule object from rules.json
 * @param {Object} req - Express request object
 * @returns {boolean} - True if the rule matches the request
 */
function match(rule, req) {

    // match HTTP method
    if (rule.method && rule.method.toLowerCase() !== req.method.toLowerCase()) return false;

    // match path (regex supported if string starts and ends with '/')
    if (rule.url && !matches(rule.url, req.path)) return false;

    var i;
    var key;

    if (rule.headers) {
        var headerKeys = Object.keys(rule.headers);
        for (i = 0; i < headerKeys.length; i++) {
            key = headerKeys[i];
            if (!matches(rule.headers[key], req.headers[key] || '')) return false;
        }
    }

    if (rule.query) {
        var queryKeys = Object.keys(rule.query);
        for (i = 0; i < queryKeys.length; i++) {
            key = queryKeys[i];
            if (!matches(rule.query[key], req.query[key] || '')) return false;
        }
    }

    if (rule.body) {
        var bodyKeys = Object.keys(rule.body);
        for (i = 0; i < bodyKeys.length; i++) {
            key = bodyKeys[i];
            var value = req.body ? req.body[key] : '';
            if (!matches(rule.body[key], value || '')) return false;
        }
    }

    return true;
}

/**
 * Compares a rule value to the actual request value
 * @param {string} pattern - Rule value (string or regex wrapped in /)
 * @param {string} value - Request value to compare against
 * @returns {boolean} - True if pattern matches the value
 */
function matches(pattern, value) {
    if (typeof pattern !== 'string') return false;

    // use RegExp match if pattern is wrapped in /
    if (pattern[0] === '/' && pattern[pattern.length - 1] === '/') {
        var regex = new RegExp(pattern.slice(1, -1));
        return regex.test(value);
    }

    // otherwise use direct equality
    return pattern === value;
}
