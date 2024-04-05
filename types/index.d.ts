// Type definitions for urisanity v0.1.5
// Project: https://github.com/codesplinta/URISanity

declare module 'urisanity' {
    export type Options = {
      allowScriptOrDataURI?: boolean,
      allowFileSystemURI?: boolean,
      allowCommsAppURI?: boolean,
      allowDBConnectionStringURI?: boolean,
      allowBrowserSpecificURI?: boolean,
      allowWebTransportURI?: boolean,
      allowServiceAPIURI?: boolean
    };
    export type Params = string | Record<string, unknown>;

    const URISanity: { 
      vet(url: string, options?: Options): string;
      isSameOrigin(uri: string): boolean;
      extractParamValueFromUri(uri: string, queryParamName: string): string;
      checkParamsOverWhiteList(uri: string, paramsWhiteList?: string[] | Record<string, RegExp>, params?: Params): boolean;
    };

    export type URISanityAPI = typeof URISanity;

    export default URISanity;
}
