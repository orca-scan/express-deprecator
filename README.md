# express-deprecator

Suppress deprecated API calls: **Why?** Because APIs accumulate legacy clients and unwanted traffic over time.

**express-deprecator** lets you:
- Drop deprecated traffic fast — no code changes
- Remove old routes entirely
- Mute requests using clean JSON rules _(no routes)_

## Features

- Lightweight, no dependencies
- Match on `method`, `url`, `headers`, `query`, or `body`
- Match using regex _(must start and end with `/`)_
- Returns `204` by default _(or custom status + response)_
- Keeps your API surface clean

## Installation

```bash
npm install express-deprecator
```

## Usage

```js
const express = require('express');
const expressDeprecator = require('express-deprecator');
const app = express();

app.use(express.json());
app.use(expressDeprecator()); // auto-loads mute-rules/rules.json
```

### mute-rules/rules.json

```json
[
  {
    "description": "Block outdated clients (v0.0.0) via POST body",
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

Mutes `POST /api/submit` requests where the JSON body includes:

```json
{
  "lib": {
    "version": "0.0.0"
  }
}
```

