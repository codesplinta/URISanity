![@isocroft](https://img.shields.io/badge/@isocroft-CodeSplinta-blue) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-cyan.svg?style=flat-square)](http://makeapullrequest.com) [![Made in Nigeria](https://img.shields.io/badge/made%20in-nigeria-008751.svg?style=flat-square)](https://github.com/acekyd/made-in-nigeria)

# URI Sanity

A small library used in the Browser and NodeJS to vet URIs (to mitigate vulnerabilities) with confidence. In other words, It's the [DOMPurify](https://www.github.com/cure53/DOMPurify) for URIs. A uniform resource locator (URL) is, in fact, a subset of [uniform resource identifiers](https://whatis.techtarget.com/definition/URI-Uniform-Resource-Identifier?_gl=1*7pixwg*_ga*NDg2NjQ5NTIxLjE2NDQ3MTE5NjA.*_ga_TQKE4GS5P9*MTY0NDcxMTk1OC4xLjAuMTY0NDcxMTk1OC4w&_ga=2.95812444.1772810844.1644711960-486649521.1644711960) (URI). Therefore, this library covers the super set of all resource identifiers where possible.

## Motivation

There are many web-based zero-day vulnerabilities that can be expolited in Browsers/NodeJS servers using Standard and/or Custom URI schemes. Certain browsers like Safari and Firefox are usually subceptible to launching such URIs without a prompt or restrictions and enable [Arbitrary File Execution](https://en.wikipedia.org/wiki/Arbitrary_code_execution#:~:text=arbitrary%20code%20execution%20(ACE)%20is%20an%20attacker's%20ability%20to%20run%20any%20commands%20or%20code%20of%20the%20attacker's%20choice%20on%20a%20target%20machine%20or%20in%20a%20target%20process.), [Remote Code Execution](https://www.checkpoint.com/cyber-hub/cyber-security/what-is-remote-code-execution-rce/#:~:text=Remote%20code%20execution%20(RCE)%20attacks,control%20over%20a%20compromised%20machine.) and/or [Connection String Pollution](https://link.springer.com/chapter/10.1007/978-3-642-16120-9_16?noAccess=true) (on the server) where possible. This is why this library was built. It moves to create a layer of protection for your web applications both on the Browser and on the Server (NodeJS only) by blocking badly formed/suspicious URIs.

Furthermore, other solutions like [braintree/sanitize-url](https://www.github.com/braintree/sanitize-url) are quite naive and a bit too specific in [it's approach](https://github.com/braintree/sanitize-url/issues/14) to URL sanitization. Also, most web front-end frameworks like **Angular** and **Vue** (safe for **React**) do not do a very robust and serious (non-trivial) job of sanitiziting URLs either. This is why this library is very important to web application developers who need reliability in sanitizing URLs.

## Validation

This library has been validated against popular malicious URIs delineated [here](https://book.hacktricks.xyz/pentesting-web/xss-cross-site-scripting) and [here](https://cheatsheetseries.owasp.org/cheatsheets/XSS_Filter_Evasion_Cheat_Sheet.html)

## Installation

Install using `npm`

```bash
npm install urisanity
```

 or install using `yarn`.

```bash
yarn add urisanity
```


## Getting Started

All you need to do is import the package appropriately depending on the environment (Browser OR Node) being used

### Browser environment

> Using a `script` tag directly inside a web page

```html
<script type="text/javascript" src="https://unpkg.com/browse/urisanity@0.1.4/dist/urisanity.min.js" crossorigin="anonymous"></script>
```

> import as ES6 module - no setup required

```js
import URISanity from 'urisanity';

const sanitizedUrl = URISanity.vet('blob:https://www.foo-.evil.com/undefined', {
  // All flag options set - valid
  allowScriptOrDataURI: false,
  allowFileSystemURI: false,
  allowCommsAppURI: true,
  allowDBConnectionStringURI: false,
  allowBrowserSpecificURI: false,
  allowWebTransportURI: false,
  allowServiceAPIURI: false,
});

console.log(sanitizedUrl); // "about:blank"

const sanitizedDBUri = URISanity.vet("jdbc:sqlserver://;servername=server_name;integratedSecurity=true;authenticationScheme=JavaKerberos", {
  // One flag option set - valid
  allowDBConnectionStringURI: true,
  allowFileSystemURI: false, // you can omit this since it's `false`
  allowCommsAppURI: false, // you can omit this since it's `false`
  allowScriptOrDataURI: false, // you can omit this since it's `false`
  allowWebTransportURI: false, // you can omit this since it's `false`
  allowServiceAPIURI: false // you can omit this since it's `false`
})

console.log(sanitizedDBUri) // "jdbc:sqlserver://;servername=server_name;integratedSecurity=true;authenticationScheme=JavaKerberos"

const sanitizedCustomUrl = URISanity.vet(
  'icloud-sharing://www.icloud.com/photos/01eFfrthOPvnfZqlKMn', {
    /* No flag options set - valid */
});

console.log(sanitizedCustomUrl); // "about:blank"

const santizedBadUrl = URISanity.vet('http://aa.com/</script>"><img src=x onerror="prompt(document.domain)">)', {
  allowWebTransportURI: true,
  allowScriptOrDataURI: true
})

console.log(sanitizedBadUrl); // "about:blank"



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

### NodeJS (commonjs) environment

> Setup an env file in your NodeJS app and include an `ORIGIN`

```.env
ORIGIN=http://127.0.0.1:4050
```

```js
const URISanity = require('urisanity');

const sanitizedFileUrl = URISanity.vet(
  'file://www.airbnb.com/Users/xxx/Desktop/index.html',
  {
    allowWebTransportURI: true
  }
);

console.log(sanitizedFileUrl) // "about:blank"
```

```js
const URISanity = require('urisanity');

let sanitizedUrl = URISanity.vet(
  'file://www.airbnb.com/Users/xxx/Desktop/index.html',
  {
    allowWebTransportURI: false,
    allowFileSystemURI: true
  }
);

console.log(sanitizedUrl) // "file://www.airbnb.com/Users/xxx/Desktop/index.html"
```
## Implementing Trusted Types

> You can make use of [**Trusted Types**](https://w3c.github.io/webappsec-trusted-types/dist/spec/#trused-script-url) while using **URI Sanity**. An excerpt from a [_**2021 report from Google on Trusted Types**_](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/2cbfffc0943dabf34c499f786080ffa2cda9cb4c.pdf) reads:

_Trusted Types are supported in several popular frameworks and libraries including
Angular, React (with a feature flag), Lit, Karma, and Webpack. Enforcing Trusted Types
in applications built on top of these frameworks is now [relatively simple](https://auth0.com/blog/securing-spa-with-trusted-types/); in some cases
no application-level code changes are required._

Before the advent of **Trusted Types** (specifically, in the days of Angular 1.x), frontend web engineers used [this approach](https://stackoverflow.com/questions/15606751/angularjs-changes-urls-to-unsafe-in-extension-page) in sanitizing URIs for web applications and it was grossly inefficient and/or naive. This is also [another approach](https://github.com/angular/angular/blob/master/packages/core/src/sanitization/url_sanitizer.ts#L36) that still doesn't cater to a much braoder system for URI sanitization. Now, with **URISanity**, you have the broader systems needed for quality URI sanitization.

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
        allowWebTransportURI: true,
      })
    },
  });
}
```

## More Use Cases

**URISanity** can be used to improve the web security of browser API sinks (injection sinks) that make use if URIs and aren't covered and/or catered for by **Trusted Types** and basic **CSP**. By instrumenting these API sinks (sinks for Document Object Model / Browser Object Model) and utilizing browser custom event API(s), the solution is quite elegant. Take a look below:

>Let's define some basic browser custom events and their handler

```javascript
/* @NOTE: Can also be the "connect-src" whitelist of urls from a CSP directive */
/* @HINT: The whitelist below is for excluding URLs that are not known to the web app and may be expoitative/suspicious */
const whitelistedURLEndpoints = [
  'https://www.facebook.com/tr',
  'https://www.google-analytics.com/collect'
]

/* @HINT: Setting custome events to check and validate URLs */
document.addEventListener( 'beforerequest', onBeforeURIUsed, false )
document.addEventListener( 'beforeinclude', onBeforeURIUsed, false )

/* @HINT: Event handler common to the two events above */
function onBeforeURIUsed ( event ) {
  /* @CHECK: https://www.npmjs.com/package/urisanity ; urisanity */
  /* @HINT: Vet the URL endpoint being requested/included for safety */
  if (window.urisanity.vet(
    event.detail.endpoint,
    { allowWebTransportURI: true }
  ) !== 'about:blank') {
    const { origin, pathname } = new URL(event.detail.endpoint)

    /* @HINT: Make sure the endpoint being requested/included is part of the whitelist */
    if (whitelistedURLEndpoints.includes(`${origin}${pathname}`)) {
      if (origin.includes('.google-analytics.')) {
        /* @HINT: Check that only the request params we need are attached */
        /* @HINT: Any other extra params should not be allowed */
        if (window.urisanity.checkParamsOverWhiteList(
          event.detail.endpoint,
          ['tid', 'cid'],
          event.detail.data
        )) {
          return;
        }
      }
    }
  }

  /* @HINT: trigger an error to be thrown when the endpoint is not in the whitelist above */
  /* @HINT: Or the validation above for any origin (or for google-analytics) doesn't pass */
  event.preventDefault()
}
```
>Now, let's instrument certain browser API sinks and make them able to throw errors on suspicion of a malformed/malicious API.

```javascript
 /*!
  * FIRST SECTION
  *
  */

/* @HINT: Extract the native definitions of these APIs from the DOM Interfaces */
const originalSetAttributeMethod = HTMLElement.prototype.setAttribute

/* @HINT: Create a new definition for `setAttribute` that instruments the API to detect suspicious URIs */
HTMLElement.prototype.setAttribute = function setAttribute (attributeName, newValue) {
	  const that = this;
	  const previousValue = that.getAttribute(attributeName);

	  const timerID = window.setTimeout(function () { 
      /* @HINT: Stop [ DOMSubtreeModified ] event from firing before [ DOMAttrModified ] event */
		  originalSetAttributeMethod.call(that, attributeName, newValue);
	  }, 0);

    /* @HINT: Whenever the attribute name is `href`, then check the URL that is the value */
    if (attributeName === 'href') {
      /* @HINT: Fire a custom event `beforeinclude` to track manual whitelisting of URL endpoints */
      let event = new window.CustomEvent('beforeinclude', {
        detail: {
          endpoint: newValue,
          sink: "HTMLElement.setAttribute",
          data: null
        },
        bubbles: true,
        cancelable: true
      });

      /* @HINT: Detect if the dispatched custom event was cancelled by a call to `event.preventDefault()` */
      /* @HINT: If the event was cancelled, it means the URL endpoint above was disallowed by the checks */
      const cancelled = !document.dispatchEvent(event)

       /* @HINT: If it's cancelled, stop the `setTimeout` call above from being executed by clearing the timeout */
       /* @HINT: Also, we throw an error to stop the call to `setAttribute` from being requested */
       if (cancelled) {
         window.clearTimeout(timerID)
         throw new Error(
           "Suspicious Activity: "
           +
           event.detail.endpoint
           +
           " request, using [ " + event.detail.data + " ] in "
           +
           " [ " + event.detail.sink + " ]"
         )
       }
    }

    /* @HINT: When listening to mutation events, might be okay to stagger certain event sequences properly */
	  if (newValue !== previousValue) {
	    let event = document.createEvent("MutationEvent");
	    event.initMutationEvent(
	      "DOMAttrModified",
	      true,
	      false,
	      that,
	      previousValue || "",
	      newValue || "",
	      attributeName,
	      (previousValue === null) ? event.ADDITION : event.MODIFICATION
	    );
		  
	    that.dispatchEvent(
        event
      );
	  }
	};


 /*!
  * NEXT SECTION
  *
  */


/* @HINT: craete a function/constructor that does nothing a.k.a no-operation function */
const noop = function noOperation () {}

/* @HINT: Copy out the user-agent interface function `sendBeacon` */
const NativeSendBeacon = window.Navigator.prototype.sendBeacon || noop

window.Navigator.prototype.sendBeacon = function sendBeacon (url, data) {
  /* @HINT: Fire a custom event `beforerequest` to track manual whitelisting of URL endpoints */
  const event = new window.CustomEvent('beforerequest', {
    detail: {
      endpoint: url,
      method: "POST",
      sink: "Navigator.sendBeacon",
      data: data
    },
    bubbles: true,
    cancelable: true
  })

  /* @HINT: Detect if the dispatched custom event was cancelled by a call to `event.preventDefault()` */
  /* @HINT: If the event was cancelled, it means the URL endpoint above was disallowed by the checks */
  const cancelled = !document.dispatchEvent(event)

   /* @HINT: If it's cancelled, we throw an error to stop the call to `sendBeacon` from being requested */
   if (cancelled) {
     throw new Error(
       "Suspicious Activity: "
       +
       event.detail.endpoint
       +
       " request, using [ " + event.detail.data + " ] in "
	      +
	      " [ " + event.detail.sink + " ]"
     )
   }

   /* @HINT: If all checks out and no error was thrown above then proceed as usual */
   return NativeSendBeacon.call(this, url, data);
};

/* @HINT: define property `name` on custom function */
  Object.defineProperty(sendBeacon, 'name', {
    writable: false,
    value: 'sendBeacon'
  });

/* @HINT: define property function `toString` on custom function */
Object.defineProperty(sendBeacon, 'toString', {
  writable: true,
  value: function toString () {
    return NativeSendBeacon.toString()
  }
})

/* @HINT: Take care of the special Firefox/IceWeasel (Gecko) property `toSource` */
if ('toSource' in NativeSendBeacon) {
  Object.defineProperty(sendBeacon, 'toSource', {
    writable: true,
    value: function toSource () {
      return NativeSendBeacon.toSource()
    }
  })
}
```

Finally, the code above in the event handler get triggered whenever `navigator.sendBeacon()` is called and the URLs are using **URISanity**.

## Documentation

Here is a brief guide to using this library and it's API method(s)

### Flag Options
>When using the `.vet(uri: String [, options: Object])` API method, there are flag option(s) to filter out different URI categories in the vetting process. They are as follows:

1. **allowCommsAppURI** : This applies only to the deep links that are used by communication tools and apps like Whatsapp, Zoom, Slack, Skype or browser comms URIs e.g. _sms, tel, whatsapp, slack_
2. **allowDBConnectionStringURI** :  This applies only to database connection string URIs e.g. _postgresql, mongodb, jdbc:mysql_
3. **allowBrowserSpecificURI** : This applies only to browser extensions, packaged apps and browser data display URIs e.g. _view-source, moz-extension_
4. **allowServiceAPIURI** : This appies only to third-party data storage services whos have specialized URIs for data transfer and storage operations e.g. _cloudinary, s3, grpc_
5. **allowScriptOrDataURI** : This applies only to script and/or data URIs e.g. _data, javascript_
6. **allowFileSystemURI** : This applies only to URIs related to the local filesystem e.g. _blob, file, local_
7. **allowWebTransportURI** : This applies only to web data transport URIs e.g. _http, ws, https, wss, blob:https_

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

## TypeScript

You can find the TS declaration [here](https://gist.github.com/isocroft/021098c660318bf92f7ab05bba042f48) (simply copy from the gist and paste in the root of your project as `urisanity.d.ts`)
