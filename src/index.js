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
const safeInternetURISchemeRegex = /^(?:(?:f|ht)tps?|cid|xmpp|mms|webcal|aaa|acap|bolo|wss?|telnet|udp|irc)/im;
/* See: https://gist.github.com/gruber/249502/61cbb59f099fdf90316c4e409c7523b6d5124f80 */
const safeURIRegex = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/?)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\)){0,}(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s\!()\[\]{};:\'\"\.\,<>?«»“”‘’]){0,})/i;
const commsAppURISchemeRegex = /^(whatsapp|zoommtg|slack|mailto|tel|callto|sms|skype)/im;
const databaseConnectionStringURISchemeRegex = /^(jdbc|odbc|pg|mongodb)/im;
const browserURISchemeRegex = /^(view-source|moz-extension|chrome-extension)/im;
const serviceAPIURISchemeRegex = /^(cloudinary)/im;
const ctrlCharactersRegex =
  /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
const urlSchemeRegex = /^([^:]+):/gm;
const dataURIRegex = /^data:(?<type>[^,]*?),(?<data>[^#]*?)(?:#(?<hash>.*))?$/i;
const scriptURIRegex = /^(?:vb|java)script:/i;
const relativeFirstCharacters = [".", "/"];
const global = self || global // browser AND NodeJS globals

function isRelativeUrlWithoutProtocol(url) {
  if (typeof url === "string") {
    return relativeFirstCharacters.indexOf(url.charAt(0)) > -1;
  }
  return false
}

function isStandardBrowserEnv() {
  const environ = global['navigator'];
  return (
    "undefined" !== typeof environ 
      && environ.product.match(/^(ReactNative|NativeScript|NS)$/i) === null
  );
};

const origin = isStandardBrowserEnv() 
? global['location'].origin 
: (global['constants'] || global['process'] && global['process'].env || {}).ORIGIN

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

  let { hostname, pathname, search, hash } = new URL(sanitizedUrl.toLowerCase())
  
  // See: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
  // See: https://datatracker.ietf.org/doc/html/rfc3986
  if (/^(?:((?:www|[a-z]{1,11})\.)(?!\1)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63}))$/i.test(hostname)
      || /^(((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(hostname)
        || /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(hostname)
          || /^(?:((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@)*)/i.test(pathname)
            || /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/i.test(search)
              || /^((?:[a-z0-9-._~]{0,}|%[1-9a-f]?[0-9a-f]|[!$&'()*+,;=])|\:|\@|\/|\?)*$/i.test(hash)) {
      if (hostname.includes('.00')) {
        return "about:blank"
      }

      if (search.match(/%3c(?=\/)?/) !== null 
          && search.includes('%3e') && search.includes('%3d')) {
        return "about:blank"
      }
  }

  if (!unsafeURISchemeRegex.test(urlScheme)
     || safeURIRegex.test(sanitizedUrl)) {
    switch (true) {
      case (!options.allowScriptOrDataURI
        || urlScheme.match(/^(java|vb)script|data/) === null):
      case !options.allowCommsAppURI:
      case !options.allowDBConnectionStringURI:
      case !options.allowBrowserURI:
        return "about:blank";
        break;
      default:
        if (options.allowScriptOrDataURI) {
          if(dataURIRegex.exec(sanitizedUrl) || scriptURIRegex.exec(sanitizedUrl)) {
             if (urlScheme !== '')
               return sanitizedUrl
          }
        }
        break;
    }
  }

  return "about:blank" // sanitizedUrl;
}

const URISanity = {
   vet(url, options) {
      return sanitizeUrl(url, options)
   }
}

export default URISanity
