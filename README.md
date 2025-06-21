# express-mute

Suppress deprecated API calls.

**Why?** Because APIs accumulate legacy clients and unwanted traffic over time.

**express-mute** lets you:
- Drop deprecated traffic fast — no code changes
- Remove old routes entirely
- Mute requests using clean JSON rules

## Features

- Lightweight (_<100 lines_, no dependencies)
- JSON rules — no routing, no handlers
- Match on `method`, `url`, `headers`, `query`, or `body`
- Supports exact and regex matches
- Returns `204 No Content` by default (or custom status + response)
- Keeps your API surface clean — no legacy routes required

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
```

### mute-rules/rules.json

```json
[
  {
    "method": "POST",
    "url": "/api/submit",
    "body": {
      "lib.version": "0.0.0"
    },
    "status": 426,
    "response": {
      "error": "This version of the client is no longer supported",
      "upgrade": "https://api.example.com/docs/v2"
    }
  }
]
```

Mutes POST /api/submit requests where the JSON body includes:

```json
{
  "lib": {
    "version": "0.0.0"
  }
}
```

* Regex is supported by wrapping the pattern in /.../ — otherwise it’s treated as a literal string
* Rules can match any combination of method, url, headers, query, and body — only the fields you define are checked
