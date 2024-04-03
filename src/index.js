/** !
 * @author: https://twitter.com/isocroft
 * @owner: https://twitter.com/codesplinta
 *
 * @Copyright (c) 2021 - 2024
 *
 * @sourced: [first-party] https://github.com/braintree/sanitize-url
 *
 * Based on the well known URI schemes;
 * See: https://en.wikipedia.org/wiki/List_of_URI_schemes
 *
 * @created: 23/06/2021
 * @last-updated: 05/04/2024
 */

/* eslint-disable no-useless-escape */

/* @HINT: all URI schemes that are mostly unsafe for web browsers to launch */
const unsafeURISchemeRegex =
  /^([^\w]*)(unsafe|javascript|vbscript|app|admin|icloud-sharing|icloud-vetting|help|aim|facetime-audio|applefeedback|ibooks|macappstore|udoc|ts|st|jar|x-apple-helpbasic|(?:x\-)?radar)/im
/* @HINT: all URI schemes that are mostly safe for web browsers to launch */
const safeInternetURISchemeRegex =
  /^(?:(?:f|ht)tps?|cid|xmpp|mms|webcal|aaa|acap|bolo|data|blob|file|local|wss?|irc|udp)/im
/* @CHECK: https://gist.github.com/gruber/249502/61cbb59f099fdf90316c4e409c7523b6d5124f80 */
const safeURIRegex =
  /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/?)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\)){0,}(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s\!()\[\]{};:\'\"\.\,<>?«»“”‘’]){0,})/i
/* @HINT: */
const commsAppURISchemeRegex =
  /^(whatsapp|zoommtg|slack|mailto|tel|callto|sms|skype)/im
const databaseConnectionStringURISchemeRegex =
  /^(jdbc(:sqlserver|:mysql|:mariadb|:sqlite)?|odbc|postgres(ql)?|mongodb)/im
const browserURISchemeRegex = /^(view-source|moz-extension|resource|res|symres|(?:filesystem:|blob:)?chrome-extension|safari|chrome|mxaddon-pkg|mx|mxwebcore|mxjscall|mbinit|safari-resource|opera|webviewprogressproxy|chromenull|chromeinvoke|chromeinvokeimmediate)/im
/* @CHECK: - FILE URI */
/* @CHECK: https://www.w3.org/TR/FileAPI/#blob-url - BLOB URL */
const fileSystemURISchemeRegex = /^((?:jar:)?file|local|blob)/im
const serviceAPIURISchemeRegex = /^(cloudinary|obsidian|gs|s3|grpc|pptr|tmtbff)/im

/* @HINT: */
const blockedHosts = [
  'widgets.amung.us',
  'v.zilionfast.in',
  'js.blinkadr.com',
  'www.superfish.com',
  'nzj.divdriver.net',
  'istatic.datafastguru.info',
  'widgets.amung.us',
  'xls.searchfun.in',
  'static.image2play.com'
]

/* @HINT: All control characters */
const ctrlCharactersRegex =
  /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim; /* eslint-disable-line */
// const urlSchemeRegex = /^([^:]+):/gm
/* @CHECK: https://datatracker.ietf.org/doc/html/rfc2397 - DATA URI */
const dataURIBINRegex =
  /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp|svg\+xml)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,(?:[a-zA-Z0-9\/+\n=]+)$/i
const dataURITEXTRegex = /^data:(?:text\/(?:javascript|html|css|plain))(?:;charset=(UTF-8|iso-8859-7))?,(?:.*)$/im
const scriptURIRegex = /^(?:vb|java)(?:\s*)?script/im
const webTransportURIRegex = /^(?:(blob:)?https?|wss?|about|mailto|tel)/im
const relativeFirstCharacters = ['.', '/']

/* @HINT: Global Stub for the Browser, ReactNative, NativeScript, NodeJS */
const $globals = typeof self === 'undefined' ? global || {} : self
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
  if (!uri || dataURITEXTRegex.test(uri.trim()) || dataURIBINRegex.test(uri.trim())) {
    return null
  }

  const regex = new RegExp('[\\?&#]' + paramName + '=([^&#]*)')
  const params = regex.exec(uri.trim())
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
  if (!uri || dataURITEXTRegex.test(uri.trim()) || dataURIBINRegex.test(uri.trim())) {
    return false
  }

  try {
    const parsedUrl = new $globals.URL(uri.trim())
    return origin === parsedUrl.origin
  } catch (error) {
    if (error) {
      return false
    }
  }
}

function checkParamsOverWhiteList (uri, paramsWhiteList = [], data = '') {
  if (!uri || dataURITEXTRegex.test(uri.trim()) || dataURIBINRegex.test(uri.trim())) {
    return false
  }

  if (typeof paramsWhiteList !== 'object') {
    return false
  }

  const parsedUrl = new $globals.URL(uri.trim())
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

  if (paramKeys.length === paramValues.length) {
    if (paramsWhiteList instanceof Array) {
      /* @HINT: Check that only the request params we need are attached */
      /* @HINT: Any other extra params should not be allowed */
      if (paramKeys.length === paramsWhiteList.length &&
        paramKeys.slice(0).sort().join('|') === paramsWhiteList.slice(0).sort().join('|')) {
        return true
      }
    } else if (paramsWhiteList instanceof Object) {
      let paramsCounter = 0
      for (; paramsCounter < paramKeys.length; paramsCounter++) {
        const paramKey = paramKeys[paramsCounter]
        const paramValue = paramValues[paramsCounter]
        const paramRegex = paramsWhiteList[paramKey]

        if (paramRegex instanceof RegExp) {
          if (!paramRegex.test(paramValue)) {
            break
          }
        } else {
          throw new Error(`"${paramKey}" does not have a matching regex pattern to match "${paramValue}"`)
        }
      }
      if (paramsCounter === paramValues.length) {
        return true
      }
    }
  }

  return false
}

/**
 * @source: https://stackoverflow.com/a/13763250
 *
 * @param {String} stringSample
 * @returns
 */
const hasHTMLEntity = (stringSample = '') => {
  if (typeof stringSample !== 'string') {
    return false
  }
  return /&(?:[a-z]+|#x?\d+);/gim.test(stringSample)
}

function sanitizeUrl (url, options = {}) {
  if (
    !url ||
    url.match(/:\/\/(?:[#$@=*.!]|[/]){0,}$/) !== null ||
    url.includes('////////////') ||
    /* @TODO: URIs that contain HTML entities should be allowed and processed by decoding them in a later release (v0.0.8) of URISanity */
    hasHTMLEntity(url) /* @NOTE: This line will need to be excluded from this `if` condition */
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
    sanitizedUrl.match(browserURISchemeRegex) ||
    sanitizedUrl.match(serviceAPIURISchemeRegex) ||
    sanitizedUrl.match(webTransportURIRegex)

  urlSchemeParseResults =
    urlSchemeParseResults !== null ? urlSchemeParseResults : []
  const urlScheme = urlSchemeParseResults[0] || ''

  try {
    const { hostname, pathname, search, hash } = new $globals.URL(
      sanitizedUrl.toLowerCase()
    )

    const matches = search.match(/\?/g) || []

    if (matches.length > 1) {
      return 'about:blank'
    }

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
      /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/gi.test(
        search
      ) ||
      /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/gi.test(
        hash
      )
    ) {
      if (hostname.includes('.00') || blockedHosts.indexOf(hostname) !== -1) {
        return 'about:blank'
      }

      if (
        pathname.toLowerCase().includes('&apos;') ||
        pathname.toLowerCase().includes('%29') ||
        pathname.toLowerCase().includes('%28') ||
        pathname.toLowerCase().includes('%20') ||
        pathname.toLowerCase().includes('%22') ||
        pathname.toLowerCase().includes('&quot;') ||
        pathname.toLowerCase().includes('(') ||
        pathname.toLowerCase().includes(')') ||
        pathname.toLowerCase().includes('%3e') ||
        pathname.toLowerCase().includes('%3c') ||
        pathname.toLowerCase().includes('><')
      ) {
        return 'about:blank'
      }

      if (
        search.toLowerCase().match(/%3c(?=\/)?/g) !== null ||
        search.toLowerCase().includes('%3e') ||
        search.toLowerCase().includes('%3f') ||
        search.toLowerCase().includes('%3d') ||
        search.toLowerCase().includes('%27') ||
        search.toLowerCase().includes('%22') ||
        search.toLowerCase().includes('&apos;') ||
        search.toLowerCase().includes('&quot;') ||
        search.toLowerCase().match(/\.(?:jar|dmg|exe|bin|sh|sed|py)/g) !== null
      ) {
        return 'about:blank'
      }
    }
  } catch (error) {
    if (error) {
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
      urlScheme.match(/^(java|vb)script|data/) !== null &&
      (dataURIBINRegex.test(sanitizedUrl) || scriptURIRegex.test(sanitizedUrl))
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

    if (
      options.allowFileSystemURI &&
      fileSystemURISchemeRegex.test(sanitizedUrl)
    ) {
      pass = true
    }

    if (urlScheme !== '' && pass) {
      return sanitizedUrl
    } else {
      return 'about:blank'
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
