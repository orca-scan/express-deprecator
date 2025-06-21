# express-mute

Suppress deprecated API calls, removing the need for legacy routes and easing load on endpoints.

**Why?** over time APIs accumulate old clients or unwanted traffic, express-mute helps to:
* Remove legacy routes from your API
* Drop deprecated traffic fast with minimal overhead
* Manage rules in JSON so updates are painless

## Features

- Lightweight _(<100 lines)_ with no dependencies
- JSON-based rules, no code changes
- Exact or regex match on `method`, `url`, `headers`, `query`, and `body`
- Returns `204 No Content` by default, or custom status and response
- No legacy route needed, keep your API clean

## Installation

```bash
npm install express-mute
```

## Usage

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
    "url": "/^\\/api\\/user\\/.*$/",
    "headers": { "x-client": "/^v1\\./" },
    "status": 410,
    "response": { "error": "Client too old" }
  }
]
```

Now, requests matching a rule are muted immediately (e.g., login with bad key → 403).

#### Rules behavior

* Regex is supported if wrapped in /.../, otherwise literal match
* You can match on any combination of method, url, headers, query, or body
