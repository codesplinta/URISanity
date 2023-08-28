// Type definitions for URI Sanity 0.1.x
// Project: https://github.com/codesplinta/URISanity

export = URISanity
export as namespace URISanity;

declare namespace URISanity {
    declare type Options = Record<string, boolean>;
    declare type Params = string | Record<string, unknown>;

    export const vet = (url: string, options?: Options) => string;
    export const isSameOrigin = (uri: string) => boolean;
    export const extractParamValueFromUri = (uri: string, queryParamName: string) => string;
    export const checkParamsOverWhiteList = (uri: string, paramsWhiteList?: string[], params?: Params) => boolean;
}
