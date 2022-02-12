/** !
 * @author: https://twitter.com/isocroft
 * @owner: https://twitter.com/codesplinta
 *
 * @Copyright (c) 2021
 *
 * @sourced: [first-party] https://github.com/braintree/sanitize-url
 *
 * Based on the well known URI schemes;
 * See: https://en.wikipedia.org/wiki/List_of_URI_schemes
 *
 * @created: 23/06/2021
 * @last-updated: 12/02/2022
 */

/* eslint-disable no-useless-escape */

/* @HINT: all URI schemes that are mostly unsafe for web browsers to launch */
const unsafeURISchemeRegex =
  /^([^\w]*)(javascript|vbscript|app|admin|icloud-sharing|icloud-vetting|file|help|facetime-audio|applefeedback|ibooks|macappstore|udoc|ts|st|x-apple-helpbasic|(?:x\-)?radar)/im
/* @HINT: all URI schemes that are mostly safe for web browsers to launch */
const safeInternetURISchemeRegex =
  /^(?:(?:f|ht)tps?|cid|xmpp|mms|webcal|aaa|acap|bolo|data|blob|wss?|irc|udp)/im
/* @CHECK: https://gist.github.com/gruber/249502/61cbb59f099fdf90316c4e409c7523b6d5124f80 */
const safeURIRegex =
  /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/?)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\)){0,}(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s\!()\[\]{};:\'\"\.\,<>?«»“”‘’]){0,})/i
/* @HINT: */
const commsAppURISchemeRegex =
  /^(whatsapp|zoommtg|slack|mailto|tel|callto|sms|skype)/im
const databaseConnectionStringURISchemeRegex =
  /^(jdbc(:sqlserver|:mysql|:mariadb|:sqlite)?|odbc|postgres(ql)?|mongodb)/im
const browserURISchemeRegex = /^(view-source|moz-extension|chrome-extension)/im
const serviceAPIURISchemeRegex = /^(cloudinary|gs|s3|grpc)/im
/* @HINT: */
const ctrlCharactersRegex =
  /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim; /* eslint-disable-line */
// const urlSchemeRegex = /^([^:]+):/gm
/* @CHECK: https://datatracker.ietf.org/doc/html/rfc2397 - DATA URI */
/* @CHECK: https://www.w3.org/TR/FileAPI/#blob-url - BLOB URL */
const dataURIRegex =
  /^(?:data:([\w-.]+\/[\w-.]+(\+[\w-.]+)?)?(;[\w-.]+=[\w-.]+)*;base64,([a-zA-Z0-9\/+\n=]+))$/
const scriptURIRegex = /^(?:vb|java)script:/i
const webTransportURIRegex = /^(?:(blob:)?https?|wss?|about)/im
const relativeFirstCharacters = ['.', '/']

/* @HINT: Global Stub for the Browser, ReactNative, NativeScript, NodeJS */
const $globals = self || global || {}
/* @HINT: Conditionally access the NodeJS process global */
const nodeJSProcess = $globals.process || { versions: { node: '.' }, env: {} }
const NODE_MAJOR_VERSION = parseInt(nodeJSProcess.versions.node.split('.')[0])

/* @CHECK: https://developer.mozilla.org/en-US/docs/Web/API/URL#browser_compatibility */
if (NODE_MAJOR_VERSION <= 12) {
  if (!$globals.URL) {
    $globals.URL = function (urlString) {
      const urlParser = require('url')
      /* urlParser.parse(): deprecarted in NodeJS v11.x */
      const parsedUrl =
        NODE_MAJOR_VERSION <= 11
          ? urlParser.parse(urlString) /* eslint-disable-line */
          : urlParser.URL(urlString)
      return Object.assign({}, parsedUrl, { hostname: parsedUrl.host })
    }
  }
}

function isStandardBrowserEnv () {
  const environ = $globals.navigator
  return (
    typeof environ !== 'undefined' &&
    environ.product.match(/^(ReactNative|NativeScript|NS)$/i) === null
  )
}

const origin = isStandardBrowserEnv()
  ? $globals.location.origin
  : ($globals.constants || nodeJSProcess.env).ORIGIN

function isRelativeUrlWithoutProtocol (url) {
  if (typeof url === 'string') {
    return relativeFirstCharacters.indexOf(url.charAt(0)) > -1
  }
  return false
}

/* @CHECK: https://gist.github.com/blafrance/4053759 */
function extractParamValueFromUri (uri, paramName) {
  if (!uri) {
    return
  }

  const regex = new RegExp('[\\?&#]' + paramName + '=([^&#]*)')
  const params = regex.exec(uri)
  if (params != null) {
    return unescape(params[1])
  }
}

function formDataToJSON (elem) {
  let current, item, key, output, value
  output = {}

  const entries =
    elem instanceof $globals.FormData
      ? elem.entries()
      : new $globals.FormData(elem).entries()

  try {
    // Iterate over values, and assign to item.
    while ((item = entries.next().value) !== null) {
      // assign to variables to make the code more readable.
      key = item[0]
      value = item[1]
      // Check if key already exist
      if (Object.prototype.hasOwnProperty.call(output, key)) {
        current = output[key]
        if (!Array.isArray(current)) {
          // If it's not an array, convert it to an array.
          current = output[key] = [current]
        }
        current.push(value) // Add the new value to the array.
      } else {
        output[key] = value
      }
    }
  } catch (_) {
    output = Object.fromEntries(entries)
  }

  return JSON.stringify(output)
}

function isSameOrigin (uri) {
  if (!uri) {
    return
  }

  const parsedUrl = new $globals.URL(uri)
  return origin === parsedUrl.origin
}

function checkParamsOverWhiteList (uri, paramsWhiteList = [], data = '') {
  const parsedUrl = new $globals.URL(uri)
  const paramKeys = []
  const paramValues = []
  let preparedData = null

  try {
    let json = ''
    if ('FormData' in $globals && data instanceof $globals.FormData) {
      if (typeof Object.fromEntries === 'function') {
        json = formDataToJSON(data)
      } else {
        const object = {}

        data.forEach(function (value, key) {
          object[key] = value
        })

        json = JSON.stringify(object)
      }
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
    if (preparedData instanceof Object) {
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

function sanitizeUrl (url, options = {}) {
  if (
    !url ||
    url.match(/:\/\/(?:[#$@=*.!]|[/]){0,}$/) !== null ||
    url.includes('////////////')
  ) {
    return 'about:blank'
  }

  let sanitizedUrl = url.replace(ctrlCharactersRegex, '').trim()

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    const originalSanitized = sanitizedUrl.startsWith('/')
      ? origin + sanitizedUrl
      : origin + '/' + sanitizedUrl
    sanitizedUrl = safeURIRegex.test(originalSanitized)
      ? originalSanitized
      : '//'
  }

  let urlSchemeParseResults =
    sanitizedUrl.match(safeInternetURISchemeRegex) ||
    sanitizedUrl.match(commsAppURISchemeRegex) ||
    sanitizedUrl.match(databaseConnectionStringURISchemeRegex) ||
    sanitizedUrl.match(browserURISchemeRegex)

  urlSchemeParseResults =
    urlSchemeParseResults !== null ? urlSchemeParseResults : []
  const urlScheme = urlSchemeParseResults[0] || ''

  const { hostname, pathname, search, hash } = new $globals.URL(
    sanitizedUrl.toLowerCase()
  )

  /* @CHECK: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names */
  /* CHECK: https://datatracker.ietf.org/doc/html/rfc3986 */
  if (
    /^(?:((?:www|[a-z]{1,11})\.)(?!\1)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63}))$/i.test(
      hostname
    ) ||
    /^(((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(
      hostname
    ) ||
    /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(
      hostname
    ) ||
    /^(?:((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@)*)/i.test(
      pathname
    ) ||
    /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/i.test(
      search
    ) ||
    /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/i.test(
      hash
    )
  ) {
    if (hostname.includes('.00')) {
      return 'about:blank'
    }

    if (
      search.toLowerCase().match(/%3c(?=\/)?/) !== null &&
      search.toLowerCase().includes('%3e') &&
      search.toLowerCase().includes('%3f') &&
      search.toLowerCase().includes('%3d') &&
      search.toLowerCase().includes('%27') &&
      search.toLowerCase().includes('%22')
    ) {
      return 'about:blank'
    }
  }

  if (
    !unsafeURISchemeRegex.test(urlScheme) ||
    safeURIRegex.test(sanitizedUrl)
  ) {
    let pass = false

    if (
      options.allowScriptOrDataURI &&
      urlScheme.match(/^(java|vb)script|data/) === null &&
      (dataURIRegex.test(sanitizedUrl) || scriptURIRegex.test(sanitizedUrl))
    ) {
      pass = true
    }

    if (options.allowCommsAppURI && commsAppURISchemeRegex.test(sanitizedUrl)) {
      pass = true
    }

    if (
      options.allowDBConnectionStringURI &&
      databaseConnectionStringURISchemeRegex.test(sanitizedUrl)
    ) {
      pass = true
    }

    if (
      options.allowServiceAPIURI &&
      serviceAPIURISchemeRegex.test(sanitizedUrl)
    ) {
      pass = true
    }

    if (
      options.allowBrowserSpecificURI &&
      browserURISchemeRegex.test(sanitizedUrl)
    ) {
      pass = true
    }

    if (
      options.allowWebTransportURI &&
      webTransportURIRegex.test(sanitizedUrl)
    ) {
      pass = true
    }

    if (urlScheme !== '' && pass) {
      return sanitizedUrl
    } else {
      return 'about:blank' // sanitizedUrl;
    }
  }
}

const URISanity = {
  isSameOrigin,
  extractParamValueFromUri,
  checkParamsOverWhiteList,
  vet (url, options = {}) {
    return sanitizeUrl(url, options || {})
  }
}

export default URISanity