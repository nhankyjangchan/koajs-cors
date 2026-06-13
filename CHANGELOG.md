# Changelog

All notable changes to this project will be documented in this file.
The project adheres to [Semantic Versioning](https://semver.org).

A more detailed list of changes can be found **[Here](https://github.com/nhankyjangchan/koa-cors/tree/main/docs)**.

## **2.1.4** / 2026-06-13

### Changed

- **Type Definitions**: `Plugin.Headers` replaced by separate `Headers` interface with `string` index signature.
- **`applyHeader` Extraction**: Moved to `src/lib/utils/applyHeader.ts`, now takes 4 parameters — eliminates per-request function allocation.
- **`mergeHeadersWithError` Refactoring**: `corsHeaders` renamed to `headers` with updated `Headers` type.
- **`cors` Middleware**: Updated `applyHeader` calls, removed unnecessary `await`, rewrote `shouldSkip` conditional logic.
- **Documentation**: Added `docs/` folder with full type declarations and changelog. Minified `README.md` options section, updated links.

### Removed

## **2.1.3** / 2026-06-12

### Changed

- **Type Definitions**: `Plugin.Headers` changed from `Record<string, string | undefined>` to `Record<string, string>`.
- **`createOriginResolver`**: Removed `isOriginSet` constant, inlined check.
- **`createCredentialsResolver`**: `staticCredentials` now explicitly casts to `boolean`.
- **`addOriginToVary`**: `existingVary` parameter typed as `unknown`.
- **`mergeHeadersWithError`**: `error.headers` accessed via dot notation instead of optional chaining.
- **`cors` Middleware**: Destructured `pluginOptions` into separate variables, refactored code for readability.
- **Dependencies**: Updated `prettier` from `^3.8.3` to `^3.8.4`.
- **Documentation**: Updated `README.md` features and options.

## **2.1.2** / 2026-06-12

### Added

- **Types**: `Plugin.Origin` and `Plugin.Credentials` type aliases.
- **Tests**: 76 total tests.

### Changed

- **Type Definitions**: `Plugin.E.headers` now optional. `Options` uses new type aliases.
- **Resolver Factories**: Now accept specific option fields directly instead of full `Options` object.
- **`createCredentialsResolver`**: Internal function renamed to `resolveDynamicCredentials`. Parameter typed as `Plugin.Credentials | undefined`.
- **`createOriginResolver`**: Parameter typed as `Plugin.Origin | undefined`. Uses explicit `Plugin.ComputeOrigin` cast.
- **`normalizeMaxAge`**: Signature changed to `(maxAge: string | number = '')`, added early return and validation.
- **Renaming**: `mergeVaryWithOrigin` → `addOriginToVary`, `mergeErrorHeaders` → `mergeHeadersWithError`. Updated signature to `(corsHeaders, e)`, handles non-Error throwables, uses spread destructuring.
- **`cors` Middleware**: Updated all calls to match new signatures, uses path aliases.

## **2.1.1** / 2026-06-01

### Info

- **Module Extraction**: Core logic split into single-responsibility modules under `src/lib/`.

### Added

- **`normalizeMaxAge` Utility**: Standalone validation/normalisation replacing inline expression.
- **`mergeErrorHeaders` Utility**: Extracted error-time CORS header attachment logic.
- **Tests**: +4 test cases, 62/62 passing, 100% code coverage.

### Changed

- **`addOriginToVary`**: Lowercase normalisation of all field names for complete deduplication.
- **`maxAge` Normalisation**: Replaced inline expression with `normalizeMaxAge` call.
- **Error Handling**: Delegated to `mergeHeadersWithError` utility.
- **Locations**: Types moved to `src/_types/`, defaults to `src/lib/options/`, resolvers to `src/lib/resolvers/`.
- **Immutability**: `credentials` variable now `const`.

### Removed

- **`@types/http-errors`**: Removed, using custom `Plugin.E` interface.

## **2.1.0** / 2026-05-23

### Info

- **No `vary` Dependency**: Internalised Vary header manipulation.
- **Build Output**: Subdirectories — `dist/esm/`, `dist/cjs/`, `dist/types/`.
- **Dual Export**: Supports default and named imports (ESM/CJS).

### Added

- **`addOriginToVary` Utility**: Internal Vary header merging, handles wildcard, deduplication, case-insensitivity.

### Changed

- **Vary Merging**: Uses internal `addOriginToVary` instead of `vary` package.
- **Build Scripts**: Updated for subdirectory output.
- **Package Exports**: Updated paths for new structure.
- **Dependencies**: Updated `@types/koa` and `koa`.
- **Tests**: Updated import style.

### Removed

- **`vary` Dependency**: Removed completely.

## **2.0.1** / 2026-05-17

### Fixed

- **Type Definitions**: Added missing `export default cors` declaration.

## **2.0.0** / 2026-05-17

### Info

- **Breaking**: `origin` now uses `Set<string>` instead of `string[]`.
- **Breaking**: Minimum Node.js ≥22, npm ≥10.
- **Build**: Artifacts no longer minified.

### Changed

- **Origin Whitelist**: O(1) lookups via `Set.prototype.has()`.
- **Export Pattern**: Dual `export function cors` + `export default cors`.
- **Type Definitions**: Updated `origin` type and JSDoc.
- **Documentation**: Updated `README.md` for `Set` usage.
- **Tests**: Updated for `Set` instances, 51/51 passing.

### Removed

- **Package Entry Points**: `types`, `module`, `main` removed — `exports` map only.

## **1.4.4** / 2026-04-30

### Changed

- **Documentation**: Improved `README.md`, added badges.
- **Dependencies**: `typescript` updated to `^6.0.3`.

## **1.4.3** / 2026-04-21

### Changed

- **Documentation**: `README.md` visual improvements. Updated `.gitignore`, `.prettierignore`.

## **1.4.2** / 2026-04-18

### Added

- **Tests**: +1 test for dynamic origin returning non-string value.

### Changed

- **Naming**: Internal resolvers renamed for clarity.
- **Error Handling**: Shortened variable names.
- **Dynamic Origin Safety**: Added `typeof origin === 'string'` type guard.

## **1.4.1** / 2026-04-17

### Changed

- **Documentation**: `README.md` restructured, `SECURITY.md` rewritten.
- **Type Definitions**: Enhanced JSDoc with MDN/Fetch spec references.

## **1.4.0** / 2026-04-15

### Info

- **Package Migration**: Renamed to `@nhankyjangchan/koa-cors`. Legacy package enters maintenance mode.
- **Repository**: Renamed to `koa-cors`.

### Added

- **Tests**: +1 test for invalid origin type, 50/50 passing.

### Changed

- **Optional Options**: `options` parameter now defaults to `{}`.
- **Invalid Origin Handling**: Returns `500` instead of `403` for invalid types.
- **Type Definitions**: Moved to `Plugin` namespace.

## **1.3.2** / 2026-04-13

### Changed

- **Code Cleanup**: Moved variable declarations closer to usage.
- **Package Metadata**: Corrected keywords casing.
- **Build Output**: Added `'use strict'` to CJS artifact.

## **1.3.1** / 2026-04-12

### Fixed

- **`maxAge` Type**: Now accepts `number` and `undefined` in addition to `string`.

## **1.3.0** / 2026-04-11

### Added

- **Dynamic Credentials**: `credentials` now accepts function for context-aware policies.
- **Tests**: +5 tests, 49/49 passing.

### Changed

- **Resolver Factories**: Pre-compute strategies at startup for performance.
- **`shouldSkip`**: Type check computed once at startup.

## **1.2.0** / 2026-04-10

### Added

- **Dynamic Origin**: `origin` now accepts function for async resolution.
- **Conditional Skipping**: `shouldSkip` option to bypass CORS.
- **Tests**: +4 tests for function-based origin.

### Changed

- **Origin Validation**: Refactored into dedicated functions.
- **Defaults**: `shouldSkip: false` set explicitly.
- **Naming**: `setHeader` → `applyHeader`.

### Removed

- **Redundant Validation**: Removed `doesOriginExist` check.

## **1.1.0** / 2026-04-07

### Added

- **Tests**: 40/40 passing.

### Changed

- **Origin Validation**: Strict string matching, `'*'` wildcard support.
- **Error Handling**: Removed `Vary`/`vary` duplicates, no `instanceof HttpError` checks.
- **Headers**: CORS headers reliably attached to all thrown objects.

### Removed

- **`http-errors` Runtime**: Only type import remains.

## **1.0.0** / 2026-04-05

- Initial release.
