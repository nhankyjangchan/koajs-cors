# @nhankyjangchan/koa-cors

Previous name before v1.4.0 was [@nhankyjangchan/koajs-cors](https://www.npmjs.com/package/@nhankyjangchan/koajs-cors), which is now a legacy package

[![npm version](https://img.shields.io/npm/v/%40nhankyjangchan%2Fkoa-cors?style=for-the-badge&logo=npm&color=blue)](https://www.npmjs.com/package/@nhankyjangchan/koa-cors)
[![github repo](https://img.shields.io/badge/github-repo-blue?logo=github&style=for-the-badge)](https://github.com/nhankyjangchan/koa-cors)
[![node version](https://img.shields.io/badge/node.js-%3E%3Dv20-yellow?logo=nodedotjs&style=for-the-badge)](https://nodejs.org/en/download)
[![bun version](https://img.shields.io/badge/bun-%3E%3Dv1.3-yellow?logo=bun&style=for-the-badge)](https://bun.com/)
[![npm downloads](https://img.shields.io/npm/dw/%40nhankyjangchan%2Fkoa-cors?style=for-the-badge&color=lightgreen)](https://www.npmjs.com/package/@nhankyjangchan/koa-cors)
[![unpacked Size](https://img.shields.io/npm/unpacked-size/%40nhankyjangchan%2Fkoa-cors?style=for-the-badge&color=lightgreen)](https://www.npmjs.com/package/@nhankyjangchan/koa-cors)
[![last update](https://img.shields.io/npm/last-update/%40nhankyjangchan%2Fkoa-cors?style=for-the-badge&color=lightgreen)](https://www.npmjs.com/package/@nhankyjangchan/koa-cors)
[![license](https://img.shields.io/npm/l/%40nhankyjangchan%2Fkoa-cors?style=for-the-badge&color=orange)](https://github.com/nhankyjangchan/koa-cors/blob/main/LICENSE)

[Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en/docs/Web/HTTP/Access_control_CORS) for KoaJS written in TypeScript

Handles CORS requests by setting appropriate headers for both simple requests and preflight (OPTIONS) requests. Validates the `Origin` header against the configured whitelist and throws a 403 error for unauthorized origins. Throws a 500 error if the `origin` option is set to an invalid type.

Automatically adds `Vary: Origin` header to all responses to ensure proper caching behaviour when different origins may receive different headers.

**Features:**

- Static or dynamic origin validation (string, array, or function)
- Automatically adds `Vary: Origin` header for proper caching
- Preflight request handling with proper method and header validation
- Credentials support with automatic `*` to explicit origin conversion
- Private Network Access support
- Cross-Origin-Opener-Policy and Cross-Origin-Embedder-Policy headers
- Error handling with CORS header preservation
- Conditional skipping of CORS processing

## ⚠️ WARNING

> **Package Migration!**
>
> This package was previously published as **`@nhankyjangchan/koajs-cors`**.
> To get the latest features, bug fixes, and improvements, please switch to the new **`@nhankyjangchan/koa-cors`** package instead of legacy `@nhankyjangchan/koajs-cors`.
> The legacy package is now in **maintenance mode** and will only receive critical security fixes beyond version `1.3.x`.

## Installation

```bash
$ npm i @nhankyjangchan/koa-cors
```

or

```bash
$ bun add @nhankyjangchan/koa-cors
```

or for legacy package

```bash
$ npm i @nhankyjangchan/koajs-cors@^1.1.0
```

## Options

```ts
/**
 * CORS middleware configuration options.
 */
export interface Options {
    /**
     * Configure the `Access-Control-Allow-Origin` header.
     *
     * Accepts a static string, an array of allowed origins, or a function for dynamic resolution.
     * The function receives the Koa context and may return a string or a Promise resolving to a string.
     * If the function returns a falsy value (empty string, `null`, `undefined`), the request will be rejected with a 403.
     * If the option is set to an invalid type, the request will be rejected with a 500.
     *
     * @default '*'
     * @example
     * // Static origin
     * origin: 'https://example.com'
     *
     * // Whitelist of origins
     * origin: ['https://example.com', 'https://another.com']
     *
     * // Dynamic origin resolution
     * origin: (ctx) => {
     *   const allowedOrigins = ['https://app.com', 'https://admin.app.com'];
     *   return allowedOrigins.includes(ctx.get('Origin')) ? ctx.get('Origin') : '';
     * }
     *
     * // Asynchronous origin resolution (e.g., database lookup)
     * origin: async (ctx) => {
     *   const domain = await db.domains.findOne({ url: ctx.get('Origin') });
     *   return domain ? domain.url : '';
     * }
     */
    origin?: string | string[] | Plugin.ComputeOrigin;

    /**
     * Configure the `Access-Control-Allow-Methods` header.
     *
     * @default ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE']
     * @example
     * allowMethods: ['GET', 'POST']
     * allowMethods: 'GET,POST,PUT'
     */
    allowMethods?: string | string[];

    /**
     * Configure the `Access-Control-Expose-Headers` header.
     *
     * @example
     * exposeHeaders: ['Content-Length', 'X-Custom-Header']
     * exposeHeaders: 'Content-Length,X-Custom-Header'
     */
    exposeHeaders?: string | string[];

    /**
     * Configure the `Access-Control-Allow-Headers` header.
     * If not specified during preflight, the value of `Access-Control-Request-Headers` will be echoed back.
     *
     * @example
     * allowHeaders: ['Content-Type', 'Authorization']
     * allowHeaders: 'Content-Type,Authorization,X-Requested-With'
     */
    allowHeaders?: string | string[];

    /**
     * Configure the `Access-Control-Max-Age` header (in seconds).
     * Specifies how long the results of a preflight request can be cached.
     *
     * @default '3600'
     * @example
     * maxAge: '86400' // 24 hours
     */
    maxAge?: string | number;

    /**
     * Configure the `Access-Control-Allow-Credentials` header.
     * Indicates whether the request can include user credentials like cookies,
     * HTTP authentication, or client-side SSL certificates.
     *
     * Note: When credentials are enabled and `origin: '*'` is configured,
     * the `Access-Control-Allow-Origin` header will be set to the actual
     * request origin instead of `'*'` to comply with the CORS specification.
     *
     * @default false
     */
    credentials?: boolean | Plugin.Predicate;

    /**
     * Enable Private Network Access handling.
     * Adds the `Access-Control-Allow-Private-Network` header for preflight requests
     * when the `Access-Control-Request-Private-Network` header is present.
     *
     * This is required for requests from public websites to resources within
     * private networks (e.g., localhost, intranet) as per the Private Network Access specification.
     *
     * @default false
     * @see https://developer.chrome.com/docs/web-platform/private-network-access/
     */
    privateNetworkAccess?: boolean;

    /**
     * Enable Cross-Origin-Opener-Policy header.
     * Sets `Cross-Origin-Opener-Policy: same-origin` on all responses (including preflight).
     *
     * This header prevents cross-origin documents from sharing a browsing context group,
     * providing process isolation and preventing certain types of cross-origin attacks.
     *
     * @default false
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy
     */
    originOpenerPolicy?: boolean;

    /**
     * Enable Cross-Origin-Embedder-Policy header.
     * Sets `Cross-Origin-Embedder-Policy: require-corp` on all responses (including preflight).
     *
     * This header prevents the document from loading cross-origin resources that don't
     * explicitly grant permission using CORS or the `Cross-Origin-Resource-Policy` header.
     *
     * @default false
     * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Embedder-Policy
     */
    originEmbedderPolicy?: boolean;

    /**
     * Keep CORS headers when an error is thrown during request processing.
     * When enabled, CORS headers are attached to the `err.headers` object,
     * ensuring they are sent even in error responses.
     *
     * The middleware also properly merges the `Vary: Origin` header with any
     * existing `Vary` headers from the error object.
     *
     * @default true
     */
    keepHeadersOnError?: boolean;

    /**
     * Conditionally skip CORS processing for specific requests.
     *
     * Accepts a function that receives the Koa context and returns a boolean
     * (or a Promise resolving to a boolean). If the function returns `true`,
     * the middleware immediately calls `next()` without adding any CORS headers.
     *
     * Set to `false` or not set anything to never skip CORS processing.
     *
     * @default false
     * @example
     * // Skip CORS for health check endpoint
     * shouldSkip: (ctx) => ctx.path === '/health'
     *
     * // Skip CORS based on a header
     * shouldSkip: (ctx) => ctx.get('X-Internal-Request') === 'true'
     *
     * // Asynchronous skip condition
     * shouldSkip: async (ctx) => {
     *   const isWhitelistedIP = await ipWhitelist.check(ctx.ip);
     *   return isWhitelistedIP;
     * }
     */
    shouldSkip?: false | Plugin.Predicate;
}
```

## Default options

```ts
/**
 * CORS middleware default configuration options.
 */
const defaultOptions: Options = {
    origin: '*',
    allowMethods: ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE'],
    maxAge: '3600',
    credentials: false,
    privateNetworkAccess: false,
    originOpenerPolicy: false,
    originEmbedderPolicy: false,
    keepHeadersOnError: true,
    shouldSkip: false
};
```

## Usage

```ts
/**
 * File `src/plugins/cors.plugin.ts`.
 */
import koaCors from '@nhankyjangchan/koa-cors'; // ESM
const koaCors = require('@nhankyjangchan/koa-cors').default; // CJS
// For version before v1.4.0 use `@nhankyjangchan/koajs-cors`
import type { Options } from '@nhankyjangchan/koa-cors';
import type { Middleware } from 'koa';

const cors: Middleware = (function () {
    const options: Options = {
        origin: 'https://example.com',
        allowMethods: ['HEAD', 'GET', 'POST', 'PUT', 'DELETE'],
        exposeHeaders: ['X-Pagination-Offset', 'X-Response-Time'],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: 3600,
        credentials: true,
        privateNetworkAccess: false,
        originOpenerPolicy: false,
        originEmbedderPolicy: false,
        keepHeadersOnError: true,
        shouldSkip: false
    };

    return koaCors(options);
})();

export default cors;

/**
 * File `src/app.ts`.
 */
import Koa from 'koa';
import cors from './plugins/cors.plugin.ts';

const app = new Koa();

app.use(cors);
// ...
app.listen(3000);
```

## Tests

```bash
$ bun test --coverage
```

## Releases

[CHANGELOG](./CHANGELOG.md)

## License

[MIT](./LICENSE)
