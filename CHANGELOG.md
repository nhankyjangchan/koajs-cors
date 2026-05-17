# Changelog

All notable changes to this project will be documented in this file.
The project adheres to [Semantic Versioning](https://semver.org).

## **2.0.0** / 2026-05-17

### Info

- **Breaking Change**: The `origin` option now uses `Set<string>` instead of `string[]` for whitelist-based origin validation. Arrays are no longer accepted. Users migrating from previous versions must replace `origin: ['https://example.com', 'https://another.com']` with `origin: new Set(['https://example.com', 'https://another.com'])`.
- **Breaking Change**: Minimum supported Node.js version has been raised from `>=20` to `>=22`, and npm from `>=8` to `>=10`. This reflects the end-of-life status of older Node.js and npm releases and allows the package to leverage modern runtime features.
- **Build Output**: The CommonJS and ESM build artifacts are no longer minified. This improves debuggability and readability of the distributed code, making stack traces and error inspection significantly easier in production environments without relying on source maps.
- **Package Metadata**: Updated the `keywords` array in `package.json` to include the current and legacy package names (`@nhankyjangchan/koa-cors`, `@nhankyjangchan/koajs-cors`). This change affects only npm search indexing and does not impact the middleware's functional logic.

### Changed

- **Origin Whitelist Type**: The `origin` option in the `Options` interface now accepts `Set<string>` instead of `string[]` for whitelist-based origin validation. The internal `matchOriginFromList` resolver uses `Set.prototype.has()` for O(1) lookups, replacing the previous `Array.prototype.includes()` O(n) scan. This significantly improves performance for large origin whitelists and provides stronger typing semantics.
- **Export Pattern**: The function export style in the source code has been changed from `export default function cors()` to a separate named `export function cors()` paired with `export default cors`. This dual-export pattern allows consumers to import the middleware via both `import cors from '...'` (default) and `import { cors } from '...'` (named), providing greater flexibility for various module systems and coding conventions.
- **Type Definitions**: Updated `origin` type in `index.d.ts` from `string | string[] | Plugin.ComputeOrigin` to `string | Set<string> | Plugin.ComputeOrigin`. JSDoc examples and descriptions have been updated to reflect the new `Set`-based whitelist usage.
- **Documentation**: Updated `README.md` to reflect the `Set<string>` type for the `origin` option. The "Features" section and option descriptions now correctly reference `Set` instead of array-based whitelists.
- **Tests**: Updated all test cases that previously used arrays for the `origin` option to use `Set` instances. The invalid origin type test now passes an array `['invalid']` to verify that the middleware correctly responds with `500` for unsupported types (arrays are no longer valid). The dynamic origin resolver test for non-string return values now uses an array `['invalid']` instead of a `Set` object to test the type-guard rejection path, while keeping the `Set` test for the new valid whitelist use case. All 51 tests continue to pass.

### Removed

- **Package Legacy Entry Points**: The `types`, `module`, and `main` fields have been removed from `package.json`. Module resolution is now handled exclusively through the `exports` map, which provides a cleaner and more modern approach to defining package entry points for different module systems (ESM, CJS, and TypeScript declarations).

## **1.4.4** / 2026-04-30

### Info

- **No Functional Changes**: This release includes only documentation and metadata improvements. The middleware logic, public API, and test suite remain unchanged from v1.4.2.

### Changed

- **Documentation**: Updated `README.md` with improved visual hierarchy and readability. Added coverage and test count badges to the header section. The "Installation" section now includes a note about installing `@types/koa` for TypeScript users, and the legacy package installation instruction has been removed to reduce clutter and guide users toward the current package only.
- **Development Dependencies**: Updated `typescript` from `^6.0.2` to `^6.0.3` in `devDependencies`.

## **1.4.3** / 2026-04-21

### Info

- **Documentation**: The `README.md` file has been updated with improved visual hierarchy and readability.
- **Development Files**: Updated `.gitignore` and `.prettierignore` to reflect current project structure and tooling preferences.
- **No Functional Changes**: This release includes only documentation and metadata improvements. The middleware logic, public API, and test suite remain unchanged from v1.4.2.

## **1.4.2** / 2026-04-18

### Added

- **Tests**: Added 1 new test case covering dynamic origin resolver returning a non-string value (`Set` object). The test verifies that the middleware correctly responds with a `500` status code and does not leak any CORS headers in the error response.

### Changed

- **Naming Refactor in Origin Resolver**: Internal resolution strategies within `createOriginResolver` have been renamed for improved semantic clarity:
    - `matchOriginFromString` → **`matchExactOrigin`**: Better reflects the exact-match validation behavior for string-based origin configuration.
    - `computeOrigin` → **`resolveDynamicOrigin`**: More accurately describes the resolution process for function-based origin configuration.
    - `matchOriginFromArray` → **`matchOriginFromList`**: Clarifies that the function validates against a whitelist array of allowed origins.
- **Error Handling Variable Naming**: Within the `try/catch` block for non-OPTIONS requests, local variables have been renamed for conciseness and readability:
    - `baseVaryHeader` → **`baseVary`**: Shortened without loss of meaning.
    - `mergedVaryHeader` → **`mergedVary`**: Shortened without loss of meaning.
- **Dynamic Origin Type Safety**: The `resolveDynamicOrigin` function now includes an explicit type guard check (`typeof origin === 'string'`). If the user-provided resolver returns a non-string value, the middleware correctly throws a `500 Internal Server Error` instead of passing an invalid origin downstream, aligning with the error handling behavior introduced in v1.4.0 for invalid `origin` option types.
- **Code Consistency**: Minor variable name adjustments in the error handling block to maintain consistent stylistic conventions across the codebase.

## **1.4.1** / 2026-04-17

### Info

- **Documentation**: The `README.md` file has been significantly updated with a clearer structure, improved feature list, and a dedicated package migration note. The feature list is now fully synchronised with `index.d.ts`. The security policy (`SECURITY.md`) has been rewritten for clarity and now includes detailed migration instructions, a recognition section, and a consistent visual style.
- **No Functional Changes**: This release includes only documentation and metadata updates. The middleware logic and public API remain unchanged from v1.4.0.

### Changed

- **Type Definitions (`index.d.ts`)**: Enhanced JSDoc comments across the `Options` interface and `Plugin` namespace. Added `@see` references to MDN and Fetch Standard specifications for all CORS-related options. Improved the feature list in the main `cors` function description to be more comprehensive and aligned with `README.md`.

## **1.4.0** / 2026-04-15

### Info

- **Package Migration**: The previous package `@nhankyjangchan/koajs-cors` is now considered **legacy** and will enter **maintenance mode**. Legacy package will receive critical security fixes only starting from version `1.3.x`. Users are strongly encouraged to migrate to `@nhankyjangchan/koa-cors` to receive ongoing feature updates and improvements.
- **Package Renamed**: The package has been officially renamed from `@nhankyjangchan/koajs-cors` to **`@nhankyjangchan/koa-cors`**. This change reflects a cleaner, more conventional naming pattern for Koa middleware packages and aligns with community standards.
- **Package Metadata**: All metadata fields in `package.json` have been updated to reflect the new package name, including `name`, `bugs`, `homepage`, and `repository`. Package description, keywords, author information, and license remain unchanged to maintain consistency.
- **GitHub Repository**: The repository has been renamed from `koajs-cors` to **`koa-cors`**. All references in the package metadata, documentation, and badges have been updated accordingly. Issue templates have also been updated to reflect the new package and repository name. GitHub automatically redirects traffic from the old repository URL to the new one, ensuring existing links and bookmarks continue to function without interruption.
- **Security Policy**: The package security policy has been updated to reflect the package changes. The supported versions table has been revised to include the `1.4.x` release line as actively maintained, while `1.2.x` and `1.1.x` are now marked as no longer supported. All security advisory procedures and disclosure policies remain otherwise unchanged.

### Added

- **Tests**: Added 1 new test case covering the invalid `origin` type scenario (`Set` object passed as `origin`). The test verifies that the middleware correctly responds with a `500` status code and does not leak any CORS headers in the error response. Total test suite now passes 50 out of 50 tests.

### Changed

- **Optional Options Parameter**: The `options` parameter in the middleware factory function is now optional and defaults to an empty object `{}`. Previously, the parameter was required, forcing users to explicitly pass an object even when using all default settings. This change improves developer experience by allowing the middleware to be used as `app.use(cors())` without providing an empty configuration object.
- **Invalid Origin Type Handling**: Updated error handling for invalid `origin` option types. Previously, when the `origin` option was set to an invalid type (e.g., `number`, `boolean`, `object`, `Set`, `Map`, etc.), the middleware would incorrectly respond with a `403 Forbidden` error, which was semantically misleading since the issue is a server-side configuration error rather than an authorization failure. The middleware now correctly throws a `500 Internal Server Error`, providing clearer and more accurate feedback during development and debugging.
- **Type Definitions Refactoring**: Internal type definitions (`Predicate`, `OriginResolver`, `CredentialsResolver`, `Headers`) have been moved into a dedicated `Plugin` namespace. This improves code organization and provides a cleaner public API surface for TypeScript users. The `Options` interface now references `Plugin.ComputeOrigin` and `Plugin.Predicate` instead of inline function signatures.

## **1.3.2** / 2026-04-13

### Info

- **No Functional Impact**: The changes in this release are limited to internal code organization, package manifest metadata, and build artifact formatting. There are no changes to API contracts, request handling logic, or type definitions. Existing tests (49/49) continue to pass without modification.

### Changed

- **Code Cleanup**: Moved `originType` and `isOriginArray` constant initialization inside the `createOriginResolver` factory function. This is a cosmetic refactor that does not alter runtime behavior or performance characteristics; it simply keeps the variable declarations closer to their usage scope within the resolver factory.
- **Package Metadata**: Updated the `keywords` array in `package.json` to correct the casing of the package name. This change affects only npm search indexing and does not impact the middleware's functional logic.
- **CommonJS Build Output**: The compiled `index.cjs` file now includes a `'use strict'` directive. This ensures strict mode compliance for legacy CommonJS environments and aligns the build artifact with modern JavaScript best practices, while having zero impact on the middleware's API or functional behavior.

## **1.3.1** / 2026-04-12

### Fixed

- **`maxAge` Type Extension**: The `maxAge` option in the `Options` interface now accepts `number` and `undefined` in addition to `string`. This aligns the TypeScript definitions with the internal runtime coercion logic (`String(pluginOptions.maxAge)`), allowing users to pass numeric values (e.g., `3600`) directly without type errors.

## **1.3.0** / 2026-04-11

### Added

- **Dynamic Credentials Resolution**: The `credentials` option now accepts a function `(ctx: Context) => boolean | Promise<boolean>`, enabling dynamic and context-aware CORS credential policies (e.g., enabling credentials only for authenticated requests).
- **Tests**: Added 5 new test cases covering function-based `credentials` and `shouldSkip` options, bringing the total test suite to 49 of 49 passing tests.

### Changed

- **Origin Resolver Factory**: Introduced `createOriginResolver` factory function. This closure pre-computes the origin validation strategy at startup and returns a bound resolver (`matchOriginFromString`, `computeOrigin`, `matchOriginFromArray`, or `rejectRequest`) based on `Options.origin` type, eliminating redundant type checking on every request cycle and positively impacting performance.
- **Credentials Resolver Factory**: Introduced `createCredentialsResolver` factory function. This closure pre-computes the credentials resolution strategy at startup, returning either `computeCredentials` (for function-based config) or `staticCredentials` (for boolean config), optimizing per-request evaluation.
- **`shouldSkip` Evaluation**: The `typeof pluginOptions.shouldSkip === 'function'` check is now computed once at startup and stored in `isShouldSkipFunction` constant, removing runtime type checking overhead on every request.

## **1.2.0** / 2026-04-10

### Added

- **Dynamic Origin Resolution**: The `origin` option now accepts a function `(ctx: Context) => string | Promise<string>`, allowing for asynchronous and context-aware origin validation (e.g., database lookups or complex whitelist logic).
- **Conditional Skipping**: Added `shouldSkip` option. Accepts a function `(ctx: Context) => boolean | Promise<boolean>` to bypass CORS headers entirely for specific requests (e.g., static assets or internal health checks) without executing origin validation logic.
- **Tests**: Added 4 new test cases specifically for the function-based `origin` option, all passed successfully

### Changed

- **Origin Validation Flow**: Refactored internal origin checking into dedicated `resolveOrigin`, `matchOriginFromString`, `matchOriginFromArray`, and `computeOrigin` functions for improved code clarity and maintainability.
- **Default Options**: Explicitly set `shouldSkip: false` in `defaultOptions` to ensure predictable behavior when the option is omitted.
- **Naming**: Internal helper `setHeader` renamed to `applyHeader` and variable `errorHeaders` renamed to `headersFromError` for better semantic accuracy.

### Removed

- **Redundant Validation**: Removed the explicit check for `pluginOptions.origin` existence (the `doesOriginExist` boolean logic from v1.1.0) as the `resolveOrigin` function now gracefully handles missing or invalid configurations via type checking and 403 fallback.

## **1.1.0** / 2026-04-07

### Added

- **Tests**: Integrated a comprehensive test suite. Currently passing 40 out of 40 tests to ensure middleware stability.

### Changed

- **Origin Validation**: Strict origin checking for string-based `origin` option. Previously any string was accepted; now the middleware validates that the request origin matches the configured origin (or allows `'*'`), otherwise throws 403.
- **Error Handling**: Refactored the header merging logic during exceptions. The middleware now:
    - Removes existing `Vary`/`vary` headers from the error object before injecting a merged `Origin` value to prevent duplicates and casing issues.
    - No longer uses `instanceof HttpError` checks, simplifying error handling across different error types.
- **Header Consistency**: Improved how `err.headers` are constructed to ensure CORS headers are reliably attached to all thrown objects, regardless of their origin.

### Removed

- **`http-errors` dependency**: The middleware no longer relies on runtime `HttpError` checks, using only the type import. This makes it more lightweight and compatible with various error-throwing patterns.

## **1.0.0** / 2026-04-05

### Info

- Initial release.
