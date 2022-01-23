[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# URI Sanity
A small library used in the Browser and NodeJS to sanitize URIs (to mitigate vulnerabilities) with confidence

## Installation

```bash
npm install URISanity
```

## Getting Started

### Browser environment
>Simply import as ES6 module - no setup required
```js
import URISanity from 'URISanity';

const sanitizedUrl = URISanity.vet(
  'view-source:https://www.example.com/undefined',
  { // Flag Options
    allowScriptOrDataURI: false,
    allowCommsAppURI: true,
    allowDBConnectionStringURI: false,
    allowBrowserSpecificURI: false,
    allowWebTransportURI: false,
    allowServiceAPIURI: false
  }
);

console.log(sanitizedUrl) // "about:blank"

const paramValue = URISanity.extractParamFromUri(
  'https://www.example.com?xyz=%200000#intro',
  'xyz'
);

console.log(paramValue) // " 0000"

const checkPassed = URISanity.checkParamsOverWhiteList(
  'grpc://api.broker.rt-msg.io:443/',
  ["user"],
  '?user=sal%C3%A1ta'
);

console.log(checkPassed) // true
```

### NodeJS environment
>Setup an env file and include an `ORIGIN`
```.env
ORIGIN=http://127.0.0.1:4050
```

```js

const URISanity = require('URISanity')

let sanitizedUrl = URISanity.vet('', {
  allowWebTransportURI: false,
  allowServiceAPIURI: false
})

```
