[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# URI Sanity
A small library used in the Browser and NodeJS to sanitize URIs (to mitigate vulnerabilities) with confidence. In other words, It's the [DOMPurify](https://www.github.com/cure53/DOMPurify) for URIs.

## Motivation
There are many web-based zero-day vulnerabilities that can be expolited using Standard and/or Custom URI schemes. Certain browsers like Safari and Firefox are usually subceptible to launching such URIs without a prompt or restrictions and enable [Arbitrary File Execution]() and/or [Remote Code Execution]()

## Installation

```bash
npm install URISanity
```

## Getting Started

### Browser environment
>Simply import as ES6 module - no setup required

```js
import URISanity from 'urisanity';

const sanitizedUrl = URISanity.vet(
  'blob:https://www.foo-.evil.com/undefined',
  { // All Flag Options
    allowScriptOrDataURI: false,
    allowCommsAppURI: true,
    allowDBConnectionStringURI: true,
    allowBrowserSpecificURI: false,
    allowWebTransportURI: false,
    allowServiceAPIURI: false
  }
);

console.log(sanitizedUrl) // "about:blank"

const sanitizedCustomUrl = URISanity.vet(
  'icloud-sharing://www.icloud.com/photos/01eFfrthOPvnfZqlKMn',
)

console.log(sanitizedCustomUrl) // "about:blank"

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

const URISanity = require('urisanity')

let sanitizedUrl = URISanity.vet('file://www.airbnb.com/Users/xxx/Desktop/index.html', {
  allowWebTransportURI: true,
})

```

## Trusted Types

>You can make use of [**Trusted Types**]() while using **URI Sanity**

```js

import URISanity from 'urisanity';
import DOMPurify from 'dompurify';

window.addEventListener(
  'securitypolicyviolation',
  console.error.bind(console)
);

/* @HINT: feature / object detection */
if (typeof window.trustedTypes !== 'undefined') {
  trustedTypes.createPolicy('default', {
    createHTML: (html) => {
      /* @HINT: 
        
        sanitize all potentially malicious characters from HTML string 
      */
      return DOMPurify.sanitize(html, {
        USE_PROFILES: {
          html: true,
          svg: true
        }
      })
    },
    createScriptURL: (url) => {
      /* @HINT: 
        
        sanitize all potentially malicious characters from URL string 
      */
      return URISanity.vet(url, {
        allowWebTransportURI: true,
      })
    }
  })
}

```
