# URISanity
sanitize uris in web and web-like applications with confidence

## Installation

```bash
npm install URISanity
```

## Getting Started

```js
const URISanity = require('URISanity')

const sanitizedUrl = URISanity.vet('view-source:https://www.example.com/undefined', {
  allowScriptOrDataURI: false,
  allowCommsAppURI: true,
  allowDBConnectionStringURI: false,
  allowBrowserSpecificURI: false
});

console.log(sanitizedUrl) // "view-source:https://www.example.com/undefined"
```

### NodeJS environment
>Setup an env file and include an `ORIGIN`
```.env
ORIGIN=http://127.0.0.1:4050
```
