<a name="0.1.2"></a>
# 0.1.2 (2022-05-12)

### Bug Fixes
- Fixed Unhandled Error when `new URL()` constructor throws due to un-parse-able URL
- Fixed null character bytes ignored in scheme of URI in *Firefox* within `new URL(uri)` call
- Fixed non-malicious **data:** URI failing to pass as well-formed URI

### Features Added
- **file:** (local filesystem) URI now has it's own scheme option flag: 
  * `allowFileSystemURI`

<a name="0.1.1"></a>
# 0.1.1 (2022-02-15)

### Bug Fixes
- Fixed **Error: ** `ReferenceError: window is not defined`

<a name="0.1.0"></a>
# 0.1.0 (2022-02-13)

### Feature Added
- `vet()` method
- `isSameOrigin()` method
- `checkParamsOverWhiteList()` method
- `extractParamValueFromUri()` method
- Added scheme option flags: 
  * `allowDBConnectionStringURI`
  * `allowCommsAppURI`
  * `allowScriptOrDataURI`
  * `allowWebTransportURI`
  * `allowServiceAPIURI`

### Bug Fixes
- None