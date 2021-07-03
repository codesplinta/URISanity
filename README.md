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
  allowBrowserCustomURI: false
});
```
