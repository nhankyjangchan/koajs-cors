# Changelog

All notable changes to this project will be documented in this file.
The project adheres to [Semantic Versioning](https://semver.org).

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
