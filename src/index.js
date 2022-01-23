/**!
 * @originalAuthor: https://twitter.com/BraintreeEng
 * @secondaryAuthor: https://twitter.com/isocroft
 * @owner: https://twitter.com/codesplinta
 *
 * Copyright (c) 2021
 *
 * @source: [first-party] https://github.com/braintree/sanitize-url
 *
 * Based on the well known URI schemes;
 * See: https://en.wikipedia.org/wiki/List_of_URI_schemes
 *
 * @created: 23/06/2021
 * @last-updated: 24/06/2021
 */

const unsafeURISchemeRegex = /^([^\w]*)(javascript|data|vbscript|app|admin)/im;
const safeInternetURISchemeRegex = /^(?:(?:f|ht)tps?|cid|xmpp|mms|webcal|aaa|acap|bolo|data|wss?|telnet|udp|irc)/im;
/* @CHECK: https://gist.github.com/gruber/249502/61cbb59f099fdf90316c4e409c7523b6d5124f80 */
const safeURIRegex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/?)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\)){0,}(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s\!()\[\]{};:\'\"\.\,<>?«»“”‘’]){0,})/i;
const commsAppURISchemeRegex = /^(whatsapp|zoommtg|slack|mailto|tel|callto|sms|skype)/im;
const databaseConnectionStringURISchemeRegex = /^(jdbc|odbc|pg|mongodb)/im;
const browserURISchemeRegex = /^(view-source|moz-extension|chrome-extension)/im;
const serviceAPIURISchemeRegex = /^(cloudinary|gs|s3|grpc)/im;
const ctrlCharactersRegex =
  /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
const urlSchemeRegex = /^([^:]+):/gm;
const dataURIRegex = /^data:([\w-.]+\/[\w-.]+(\+[\w-.]+)?)?(;[\w-.]+=[\w-.]+)*;base64,([a-zA-Z0-9\/+\n=]+)$/
const scriptURIRegex = /^(?:vb|java)script:/i;
const webTransportURIRegex = /^(?:https?|wss?)/im
const relativeFirstCharacters = [".", "/"];

/* @HINT: Global Stub for the Browser, ReactNative, NativeScript, NodeJS */
const globals = self || global || {}
/* @HINT: Conditionally access the NodeJS process global */
const nodeJSProcess = globals['process'] || { versions: { node: '.' }, env: {} }
const NODE_MAJOR_VERSION = parseInt(nodeJSProcess.versions.node.split('.')[0]);

/* @CHECK: https://developer.mozilla.org/en-US/docs/Web/API/URL#browser_compatibility */
if (NODE_MAJOR_VERSION < 10) {
  if (!globals.URL) {
    globals.URL = function (urlString) {
      const urlParser = require('url')
      const parsedUrl = urlParser.parse(urlString)
      return { ...parsedUrl, hostname: parsedUrl.host }
    }
  }
}

function isStandardBrowserEnv() {
  const environ = globals['navigator'];
  return (
    "undefined" !== typeof environ 
      && environ.product.match(/^(ReactNative|NativeScript|NS)$/i) === null
  );
};

const origin = isStandardBrowserEnv() 
? globals['location'].origin 
: (globals['constants'] || nodeJSProcess.env).ORIGIN

function isRelativeUrlWithoutProtocol(url) {
  if (typeof url === "string") {
    return relativeFirstCharacters.indexOf(url.charAt(0)) > -1;
  }
  return false
}

/* @CHECK: https://gist.github.com/blafrance/4053759 */
function extractParamFromUri(uri, paramName) {
  if (!uri) {
    return;
  }

  var regex = new RegExp('[\\?&#]' + paramName + '=([^&#]*)');
  var params = regex.exec(uri);
  if (params != null) {
    return unescape(params[1]);
  }

  return;
}

function checkParamsOverWhiteList (uri, paramsWhiteList = [], data = '') {
  const parsedUrl = new URL(uri)
  const paramKeys = []
  const paramValues = []
  let preparedData = null

  try {
    let json = ''
    if (('FormData' in global)
      && (data instanceof global['FormData'])) {
      let object = {}

      data.forEach(function(value, key){
        object[key] = value;
      })

      json = JSON.stringify(object);

      // json = JSON.stringify(Object.fromEntries(data.entries()));
    } else {
      json = data
    }

    if (typeof json === 'string') {
      preparedData = JSON.parse(json)
    }
  } catch (_) {
    preparedData = data
  }

  if (preparedData === '') {
    parsedUrl.searchParams.forEach(function (...args) {
      const [value, key] = args

      paramValues.push(unescape(value))
      paramKeys.push(key)
    })
  } else {
    if ((preparedData instanceof Object)) {
      paramValues.concat(Object.values(preparedData))
      paramKeys.concat(Object.keys(preparedData))
    }
  }

  /* @HINT: Check that only the request params we need are attached */
  /* @HINT: Any other extra params should not be allowed */
  if (paramKeys.length === paramsWhiteList.length) {
    return true
  }

  return false
}

function sanitizeUrl(url, options = {}) {
  if (!url 
    || (url.match(/:\/\/(?:[#$@=*.!]|[/]){0,}$/) !== null)
      || (url.includes('////////////'))) {
    return "about:blank";
  }

  const sanitizedUrl = url.replace(ctrlCharactersRegex, "").trim();

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    let originalSanitized = origin + sanitizedUrl
    sanitizedUrl = safeURIRegex.test(originalSanitized) 
      ? originalSanitized 
      : "//";
  }

  let urlSchemeParseResults = sanitizedUrl.match(
    safeInternetURISchemeRegex
  ) || sanitizedUrl.match(
    commsAppURISchemeRegex
  ) || sanitizedUrl.match(
    databaseConnectionStringURISchemeRegex
  ) || sanitizedUrl.match(
    browserURISchemeRegex
  );

  urlSchemeParseResults = urlSchemeParseResults !== null ? urlSchemeParseResults : []
  const urlScheme = urlSchemeParseResults[0] || '';

  const { hostname, pathname, search, hash } = new URL(sanitizedUrl.toLowerCase())
  
  /* @CHECK: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names */
  /* CHECK: https://datatracker.ietf.org/doc/html/rfc3986 */
  if (/^(?:((?:www|[a-z]{1,11})\.)(?!\1)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63}))$/i.test(hostname)
      || /^(((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(hostname)
        || /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(hostname)
          || /^(?:((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@)*)/i.test(pathname)
            || /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/i.test(search)
              || /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/i.test(hash)) {
      if (hostname.includes('.00')) {
        return "about:blank"
      }

      if (search.toLowerCase().match(/%3c(?=\/)?/) !== null 
          && search.toLowerCase().includes('%3e')
            && search.toLowerCase().includes('%3d')
              && search.toLowerCase().includes('%22')) {
        return "about:blank"
      }
  }

  if (!unsafeURISchemeRegex.test(urlScheme)
     || safeURIRegex.test(sanitizedUrl)) {
    let pass = false

    if (options.allowScriptOrDataURI
      && urlScheme.match(/^(java|vb)script|data/) === null 
        && (dataURIRegex.test(sanitizedUrl) || scriptURIRegex.test(sanitizedUrl))) {
      pass = true
    }

    if (options.allowCommsAppURI
      && (commsAppURISchemeRegex.test(sanitizedUrl))) {
      pass = true
    }

    if (options.allowDBConnectionStringURI
      && (databaseConnectionStringURISchemeRegex.test(sanitizedUrl))) {
      pass = true
    }

    if (options.allowServiceAPIURI
      && (serviceAPIURISchemeRegex.test(sanitizedUrl))) {
        pass = true
    }

    if (options.allowBrowserSpecificURI
      && (browserURISchemeRegex.test(sanitizedUrl))) {
      pass = true
    }

    if (options.allowWebTransportURI
      && webTransportURIRegex.test(sanitizedUrl)) {
      pass = true
    }

    if (urlScheme !== '' && pass) {
      return sanitizedUrl
    } else {
      return "about:blank" // sanitizedUrl;
    }
  }
}

const URISanity = {
  extractParamFromUri,
  checkParamsOverWhiteList,
  vet(url, options) {
    return sanitizeUrl(url, options)
  }
}

export default URISanity
