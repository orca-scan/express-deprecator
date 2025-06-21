# express-deprecator

[![Tests](https://github.com/orca-scan/express-deprecator/actions/workflows/ci.yml/badge.svg)](https://github.com/orca-scan/express-deprecator/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/express-deprecator)](https://www.npmjs.com/package/express-deprecator)
[![license](https://img.shields.io/github/license/orca-scan/express-deprecator)](https://github.com/orca-scan/express-deprecator/blob/master/LICENSE)

Drop deprecated API traffic.

**Why?** because over time, APIs accumulate old clients, outdated apps, and unsupported traffic. express-deprecator helps you phase them out without leaving legacy routes or messy logic in your express app.

**Features**
* No routes needed – matches requests before your logic runs
* Fast + lightweight – no dependencies
* Match on method, url, headers, query, or body
* Regex support – use "/^v1\\./" to match patterns
* Not a security layer – built for hygiene, not defense
* Keeps your codebase clean – no more if (version === '0.0.0')

## Install

```bash
npm install express-deprecator
```

## Usage

```js
const express = require('express');
const expressDeprecator = require('express-deprecator');
const app = express();

app.use(express.json());
app.use(expressDeprecator()); // auto-loads ./deprecations.json
```

### Example rule

Block outdated client versions in request body:

```json
[
  {
    "description": "Deprecate old client (v0.0.0)",
    "method": "POST",
    "url": "/api/submit",
    "body": {
      "lib.version": "0.0.0"
    },
    "status": 426,
    "response": {
      "error": "This version of the client is no longer supported",
      "upgrade": "https://example.com/docs/v2"
    }
  }
]
```

When a request like this is received:

```bash
POST /api/submit
Content-Type: application/json

{
  "lib": {
    "version": "0.0.0"
  }
}
```

It’s automatically blocked with:

```bash
HTTP/1.1 426 Upgrade Required
Content-Type: application/json

{
  "error": "This version of the client is no longer supported",
  "upgrade": "https://example.com/docs/v2"
}
```

### Rule syntax

* Match on any combination of:
  * `method`: "GET", "POST", etc
  * `url`: exact path or regex _(e.g. "/^\\/api\\//")_
  * `headers`: header values _(supports regex)_
  * `query`: supports nested JSON keys strings _(e.g. "payload.device.version")_
  * `body`: supports nested keys in dot notation
* Regex matches must be strings wrapped in `/`...`/`
* By default, unmatched requests are passed to your routes
* Matched requests are ended early with the given status and response

### What it’s not for

This module is not:
* a rate limiter
* a firewall
* an authentication or security layer

Use it to keep your API maintainable, not to protect it from abuse.

### Why not just use code?

You could do this in a route:

```js
if (req.body?.lib?.version === '0.0.0') {
  return res.status(426).json({ error: 'Deprecated version' });
}
```

But that logic sticks around forever. express-deprecator lets you:
* manage deprecations in a JSON file _(not source code)_
* remove rules once traffic fades
* keep your API routes lean and focused

## License

[MIT License](LICENSE) © Orca Scan - a [barcode app](https://orcascan.com) with simple [barcode tracking APIs](https://orcascan.com/guides?tag=for-developers).