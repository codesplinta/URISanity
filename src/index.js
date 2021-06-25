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
const commsAppURIPrefixesRegex = /^(whatsapp|zoommtg|slack|mailto|tel|callto|sms|skype)/im;
const databaseConnectionStringPrefixesRegex = /^(jdbc|odbc|pg|mongodb)/im;
const ctrlCharactersRegex =
  /[\u0000-\u001F\u007F-\u009F\u2000-\u200D\uFEFF]/gim;
const urlSchemeRegex = /^([^:]+):/gm;
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
: (global['process'].env || {}).ORIGIN

function sanitizeUrl(url, options = {}) {
  if (!url 
    || (url.match(/:\/\/(?:[#$@=*.!]|[/]){0,}$/) !== null)
      || (url.includes('////////////'))) {
    return "about:blank";
  }

  const sanitizedUrl = url.replace(ctrlCharactersRegex, "").trim();

  if (isRelativeUrlWithoutProtocol(sanitizedUrl)) {
    return safeURIRegex.test(origin + sanitizedUrl) 
      ? sanitizedUrl 
      : "about:blank";
  }

  const urlSchemeParseResults = sanitizedUrl.match(
    safeInternetURISchemeRegex
  ) || sanitizedUrl.match(
    commsAppURIPrefixesRegex
  ) || sanitizedUrl.match(
    databaseConnectionStringPrefixesRegex
  );
  const urlScheme = urlSchemeParseResults[0] || '';

  if (!unsafeURISchemeRegex.test(urlScheme)
     || safeURIRegex.test(sanitizedUrl)) {
    switch (true) {
      case (!options.allowScriptOrDataURI
        || urlScheme.match(/^(java|vb)script|data/) === null):
      case (!options.allowCommsAppURI || !options.dbConnectionStringURI):
        return "about:blank";
        break;
      default:
        return urlScheme !== '' ? sanitizedUrl : "about:blank";
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
