![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

# URI Sanity

A small library used in the Browser and NodeJS to vet URIs (to mitigate vulnerabilities) with confidence. In other words, It's the [DOMPurify](https://www.github.com/cure53/DOMPurify) for URIs. A uniform resource locator (URL) is, in fact, a subset of [uniform resource identifiers](https://whatis.techtarget.com/definition/URI-Uniform-Resource-Identifier?_gl=1*7pixwg*_ga*NDg2NjQ5NTIxLjE2NDQ3MTE5NjA.*_ga_TQKE4GS5P9*MTY0NDcxMTk1OC4xLjAuMTY0NDcxMTk1OC4w&_ga=2.95812444.1772810844.1644711960-486649521.1644711960) (URI). Therefore, this library covers the super set of all resource identifiers where possible.

## Motivation

There are many web-based zero-day vulnerabilities that can be expolited using Standard and/or Custom URI schemes. Certain browsers like Safari and Firefox are usually subceptible to launching such URIs without a prompt or restrictions and enable [Arbitrary File Execution](https://en.wikipedia.org/wiki/Arbitrary_code_execution#:~:text=arbitrary%20code%20execution%20(ACE)%20is%20an%20attacker's%20ability%20to%20run%20any%20commands%20or%20code%20of%20the%20attacker's%20choice%20on%20a%20target%20machine%20or%20in%20a%20target%20process.), [Remote Code Execution](https://www.checkpoint.com/cyber-hub/cyber-security/what-is-remote-code-execution-rce/#:~:text=Remote%20code%20execution%20(RCE)%20attacks,control%20over%20a%20compromised%20machine.) and/or [Connection String Pollution](https://link.springer.com/chapter/10.1007/978-3-642-16120-9_16?noAccess=true) where possible. This is why this library was built. It moves to create a layer of protection for your web applications both on the Browser and on the Server (NodeJS only).

## Installation

```bash
npm install urisanity
```

## Getting Started

All you need to do is import the package appropriately depending on the environment (Browser OR Node) being used

### Browser environment

> import as ES6 module - no setup required

```js
import URISanity from 'urisanity';

const sanitizedUrl = URISanity.vet('blob:https://www.foo-.evil.com/undefined', {
  // All Flag Options
  allowScriptOrDataURI: false,
  allowCommsAppURI: true,
  allowDBConnectionStringURI: false,
  allowBrowserSpecificURI: false,
  allowWebTransportURI: false,
  allowServiceAPIURI: false,
});

console.log(sanitizedUrl); // "about:blank"

const sanitizedDBUri = URISanity.vet("jdbc:sqlserver://;servername=server_name;integratedSecurity=true;authenticationScheme=JavaKerberos", {
  allowDBConnectionStringURI: true,
})

console.log(sanitizedDBUri) // "jdbc:sqlserver://;servername=server_name;integratedSecurity=true;authenticationScheme=JavaKerberos"

const sanitizedCustomUrl = URISanity.vet(
  'icloud-sharing://www.icloud.com/photos/01eFfrthOPvnfZqlKMn'
);

console.log(sanitizedCustomUrl); // "about:blank"

const paramValue = URISanity.extractParamValueFromUri(
  'https://www.example.com?xyz=%200000#intro',
  'xyz'
);

console.log(paramValue); // " 0000"

const checkPassed = URISanity.checkParamsOverWhiteList(
  'grpc://api.broker.rt-msg.io:443?user=sal%C3%A1ta',
  ['user']
);

console.log(checkPassed); // true

const isSame = URISanity.isSameOrigin(window.location.href)

console.log(isSame) // true
```

### NodeJS environment

> Setup an env file in your NodeJS app and include an `ORIGIN`

```.env
ORIGIN=http://127.0.0.1:4050
```

```js
const URISanity = require('urisanity');

let sanitizedUrl = URISanity.vet(
  'file://www.airbnb.com/Users/xxx/Desktop/index.html',
  {
    allowWebTransportURI: true,
  }
);

console.log(sanitizedUrl) // "about:blank"
```

## Implementing Trusted Types

> You can make use of [**Trusted Types**](https://w3c.github.io/webappsec-trusted-types/dist/spec/#trused-script-url) while using **URI Sanity**. An excerpt from a [_**2021 report from Google on Trusted Types**_](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/2cbfffc0943dabf34c499f786080ffa2cda9cb4c.pdf) reads:

_Trusted Types are supported in several popular frameworks and libraries including
Angular, React (with a feature flag), Lit, Karma, and Webpack. Enforcing Trusted Types
in applications built on top of these frameworks is now [relatively simple](https://auth0.com/blog/securing-spa-with-trusted-types/); in some cases
no application-level code changes are required._

```js
import URISanity from 'urisanity';
import DOMPurify from 'dompurify';

window.addEventListener('securitypolicyviolation', console.error.bind(console));

/* @HINT: feature / object detection */
if (typeof window.trustedTypes !== 'undefined') {
  trustedTypes.createPolicy('default', {
    createHTML: (html) => {
      /* @HINT: 
        
        sanitize all potentially malicious characters from HTML string 
      */
      return DOMPurify.sanitize(html, {
        RETURN_TRUSTED_TYPE: true,
        USE_PROFILES: {
          html: true,
          svg: true,
        },
      })
    },
    createScriptURL: (url) => {
      /* @HINT: 
        
        vet URL string and return "about:blank" if URL string is suspicious
      */
      return URISanity.vet(url, {
        allowCommsAppURI: true,
        allowWebTransportURI: true,
      })
    },
  });
}
```

## Documentation

Here is a brief guide to using this library and it's API method(s)

### Flag Options
>When using the `.vet(uri: String [, options: Object])` API method, there are flag option(s) to filter out different URI categories in the vetting process. They are as follows:

1. **allowCommsAppURI** : This applies only to the deep links that are used by communication tools and apps like Whatsapp, Zoom, Slack, Skype or browser comms URIs e.g. _sms, tel, whatsapp, slack_
2. **allowDBConnectionStringURI** :  This applies only to database connection string URIs e.g. _postgresql, mongodb, jdbc:mysql_
3. **allowBrowserSpecificURI** : This applies only to browser extension and browser data display URIs e.g. _view-source, moz-extension_
4. **allowServiceAPIURI** : This appies only to third-party data storage services whos have specialized URIs for data transfer and storage operations e.g. _cloudinary, s3, grpc_
5. **allowScriptOrDataURI** : This applies only to script and/or data URIs e.g. _data, javascript_
6. **allowWebTransportURI** : This applies only to web data transport URIs e.g. _http, ws, blob:https_

### API Methods

### `URISanity.vet(uri: String [, options: Object]): String`
>The `.vet(uri: String [, options: Object])` method is used to sanitize a URI of any [standard form](https://en.wikipedia.org/wiki/List_of_URI_schemes) to ensure that it doesn't contain unwanted and/or malicious content. Only the second argument is optional. If the second ( **options** ) argument isn't passed, it means that all [flag options](https://github.com/codesplinta/URISanity#flag-options) are `false`.

### `URISanity.extractParamValueFromUri(uri: String, queryParamName: String): String`
>The `.extractParamValueFromUri(uri: String, queryParamName: String)` method is used to extract the value of a query parameter from a given URI. Both arguments are not optional.

### `URISanity.checkParamsOverWhiteList(uri: String, paramNamesWhiteList: Array [, querySearch: String]): Boolean`
>The `.checkParamsOverWhiteList(uri: String, queryParamNames: Array [, querySearch: String | Object])` method is used to check whether the params (query OR body) associated with a given URI is correct, allowed and valid for it's use case. Only the third argument for this method is optional.

### `URISanity.isSameOrigin(uri: String): Boolean`
>The `.isSameOrigin(uri: String)` method is used to check if the URI being inspected has the sam origin (protocol + host) as the environment (Browser or NodeJS). The only argument for this method is not optional.

## License

MIT License

## Contributing

If you wish to contribute to this project, you are very much welcome. Please, create an issue first before you proceed to create a PR (either to propose a feature or fix a bug). Make sure to clone the repo, checkout to a contribution branch and build the project before making modifications to the codebase.

Run all the following command (in order they appear) below:

```bash

$ npm run lint

$ npm run build

$ npm run test
```