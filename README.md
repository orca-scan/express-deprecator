# express-mute

Tiny Express middleware to silently suppress deprecated or noisy API calls, so you don’t need to maintain legacy routes or logic.

Inspired by minimal design—just load your rules, add middleware, and your old clients are blocked before they hit your app.

## Features

- Lightweight (<100 lines)
- JSON-based rules, no code changes
- Supports exact and regex matching for `method`, `url`, `headers`, `query`, and `body`
- Early returns: default `204 No Content`, or custom status and response
- No legacy route handlers, keep your API clean

## Installation

```bash
npm install express-mute
```

## Usage

### mute-rules/rules.json

```json
[
  {
    "method": "POST",
    "url": "/api/login",
    "headers": { "x-api-key": "test-key" },
    "status": 403,
    "response": { "error": "Deprecated client" }
  },
  {
    "method": "GET",
    "url": "/api/health",
    "status": 204
  },
  {
    "method": "GET",
    "url": "/^\\/api\\/user\\/.*$/",
    "headers": { "x-client": "/^v1\\./" },
    "status": 410,
    "response": { "error": "Client too old" }
  }
]
```

#### Rules behavior

* Regex is supported if wrapped in /.../, otherwise literal match
* You can match on any combination of method, url, headers, query, or body

### Setup in your Express app

```js
const express = require('express');
const expressMute = require('express-mute');
const app = express();

app.use(express.json());
app.use(expressMute()); // auto-loads mute-rules/rules.json

app.post('/api/login', (req, res) => res.json({ ok: true }));
app.get('/api/health', (req, res) => res.send('Healthy'));
app.get('/api/user/:id', (req, res) => res.json({ id: req.params.id }));
```

Now, requests matching a rule are muted immediately (e.g., login with bad key → 403).

## Why use it?

Over time, APIs accumulate old clients, noisy endpoints, or unwanted traffic. express-mute helps you:
* Remove legacy routes with no disruption
* Drop deprecated traffic fast with minimal overhead
* Manage rules in JSON—not code—so updates are painless