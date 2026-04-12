# Changelog

All notable changes to this project will be documented in this file.
The project adheres to [Semantic Versioning](https://semver.org).

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
- **Tests**: Added 4 new test cases specifically for the function-based `origin` option, all passed successfully;

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
