import type { Middleware, Context } from 'koa';

/**
 * CORS middleware configuration options.
 * @see https://fetch.spec.whatwg.org/#http-cors-protocol
 */
export interface Options {
    /**
     * Configure the `Access-Control-Allow-Origin` header.
     *
     * Accepts a static string, a list (Set) of allowed origins, or a function for dynamic resolution.
     * The function receives the Koa context and may return a string or a Promise resolving to a string.
     * If the function returns a falsy value (empty string, `null`, `undefined`), the request will be rejected with a 403.
     * If the option is set to an invalid type, the request will be rejected with a 500.
     *
     * @default '*'
     * @see https://fetch.spec.whatwg.org/#http-origin
     * @example
     * // Static origin
     * origin: 'https://example.com'
     *
     * // Whitelist of origins
     * origin: new Set(['https://example.com', 'https://another.com'])
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
    origin?: Plugin.Origin;

    /**
     * Configure the `Access-Control-Allow-Credentials` header.
     * Indicates whether the request can include user credentials like cookies,
     * HTTP authentication, or client-side SSL certificates.
     *
     * Accepts a static boolean or a function for dynamic resolution.
     * The function receives the Koa context and may return a boolean or a Promise resolving to a boolean.
     *
     * Note: When credentials are enabled and `origin: '*'` is configured,
     * the `Access-Control-Allow-Origin` header will be set to the actual
     * request origin instead of `'*'` to comply with the CORS specification.
     *
     * @default false
     * @see https://fetch.spec.whatwg.org/#http-access-control-allow-credentials
     * @example
     * // Static credentials
     * credentials: true
     *
     * // Dynamic credentials resolution
     * credentials: (ctx) => ctx.get('X-Auth-Level') === 'trusted'
     *
     * // Asynchronous credentials resolution
     * credentials: async (ctx) => {
     *   const user = await db.users.findOne({ token: ctx.get('Authorization') });
     *   return user !== null;
     * }
     */
    credentials?: Plugin.Credentials;

    /**
     * Configure the `Access-Control-Allow-Methods` header.
     * Specifies the HTTP methods allowed when accessing the resource in response to a preflight request.
     *
     * @default ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE']
     * @see https://fetch.spec.whatwg.org/#http-access-control-allow-methods
     * @example
     * allowMethods: ['GET', 'POST']
     * allowMethods: 'GET,POST,PUT'
     */
    allowMethods?: string | string[];

    /**
     * Configure the `Access-Control-Allow-Headers` header.
     * Specifies the HTTP headers allowed during the actual request in response to a preflight request.
     * If not specified during preflight, the value of `Access-Control-Request-Headers` will be echoed back.
     *
     * @see https://fetch.spec.whatwg.org/#http-access-control-allow-headers
     * @default undefined
     * @example
     * allowHeaders: ['Content-Type', 'Authorization']
     * allowHeaders: 'Content-Type,Authorization,X-Requested-With'
     */
    allowHeaders?: string | string[];

    /**
     * Configure the `Access-Control-Max-Age` header (in seconds).
     * Specifies how long the results of a preflight request can be cached.
     * If the value cannot be parsed as an integer, the header will be omitted.
     *
     * @default '3600'
     * @see https://fetch.spec.whatwg.org/#http-access-control-max-age
     * @example
     * maxAge: 3600       // 1 hour as number
     * maxAge: '86400'    // 24 hours as string
     */
    maxAge?: string | number;

    /**
     * Configure the `Access-Control-Expose-Headers` header.
     * Specifies which response headers should be exposed to the browser in the actual request.
     *
     * @see https://fetch.spec.whatwg.org/#http-access-control-expose-headers
     * @default undefined
     * @example
     * exposeHeaders: ['Content-Length', 'X-Custom-Header']
     * exposeHeaders: 'Content-Length,X-Custom-Header'
     */
    exposeHeaders?: string | string[];

    /**
     * Enable Private Network Access handling.
     * Adds the `Access-Control-Allow-Private-Network` header for preflight requests
     * when the `Access-Control-Request-Private-Network` header is present.
     *
     * This is required for requests from public websites to resources within
     * private networks (e.g., localhost, intranet) as per the Private Network Access specification.
     *
     * @default false
     * @see https://wicg.github.io/private-network-access/#headers
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
     * @see https://html.spec.whatwg.org/dev/browsers.html#cross-origin-opener-policies
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
     * @see https://html.spec.whatwg.org/dev/browsers.html#the-coep-headers
     */
    originEmbedderPolicy?: boolean;

    /**
     * Keep CORS headers when an error is thrown during request processing.
     * When enabled, CORS headers are attached to the `err.headers` object,
     * ensuring they are sent even in error responses.
     *
     * The middleware also properly merges the `Vary: Origin` header with any
     * existing `Vary` headers from the error object, deduplicating field names
     * and converting them to lowercase for consistency.
     *
     * @default true
     * @example
     * // CORS headers will be preserved in error responses
     * keepHeadersOnError: true
     *
     * // CORS headers will NOT be attached to error responses
     * keepHeadersOnError: false
     */
    keepHeadersOnError?: boolean;

    /**
     * Conditionally skip CORS processing for specific requests.
     *
     * Accepts a function that receives the Koa context and returns a boolean
     * (or a Promise resolving to a boolean). If the function returns `true`,
     * the middleware immediately calls `next()` without adding any CORS headers.
     *
     * Set to `false` or omit to never skip CORS processing.
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

/**
 * Interface representing HTTP headers as key-value pairs.
 */
export interface Headers {
    [field: string]: string;
}

/**
 * Utility types for CORS middleware configuration and internal resolution.
 */
export declare namespace Plugin {
    /**
     * Allowed types for the `origin` option.
     * Can be a static string, a Set of allowed origins, or a function for dynamic computation.
     */
    type Origin = string | Set<string> | ComputeOrigin;

    /**
     * Function that dynamically computes the allowed origin.
     * @param ctx - Koa context object
     * @returns Allowed origin string or Promise resolving to it
     * @note If a falsy value is returned, the request is rejected with a 403
     */
    type ComputeOrigin = (ctx: Context) => string | Promise<string>;

    /**
     * Internal resolver that unifies different origin resolution strategies
     * (exact string match, Set lookup, or dynamic computation) into a single interface.
     * @param ctx - Koa context object
     * @param requestOrigin - Value of the Origin request header
     * @returns Resolved origin string or Promise resolving to it
     */
    type OriginResolver = (ctx: Context, requestOrigin: string) => string | Promise<string>;

    /**
     * Allowed types for the `credentials` option.
     * Can be a static boolean or a function for dynamic resolution.
     */
    type Credentials = boolean | Predicate;

    /**
     * Function that evaluates a boolean condition based on the request context.
     * Used for `credentials` and `shouldSkip` options.
     * @param ctx - Koa context object
     * @returns Boolean value or Promise resolving to a boolean
     */
    type Predicate = (ctx: Context) => boolean | Promise<boolean>;

    /**
     * Custom error object with optional CORS headers attached.
     * Used internally to preserve CORS headers in error responses
     * when `keepHeadersOnError` is enabled.
     */
    type E = Error & {
        headers?: Headers;
    };
}

/**
 * Cross-Origin Resource Sharing (CORS) middleware for Koa.
 *
 * Handles CORS requests by setting appropriate headers for both simple requests
 * and preflight (OPTIONS) requests. Validates the `Origin` header against the
 * configured origin and throws a 403 error for unauthorized origins.
 * Throws a 500 error if the `origin` option is set to an invalid type.
 *
 * Automatically adds `Vary: Origin` header to all responses to ensure proper
 * caching behaviour when different origins may receive different headers.
 *
 * Features:
 * - Static or dynamic origin validation (string, Set, or function, including async)
 * - Dynamic credentials resolution (boolean or function, including async)
 * - Automatic rejection of unauthorized origins (403) and invalid configuration (500)
 * - Automatically adds `Vary: Origin` header for proper caching
 * - Proper merging of `Vary` headers during error handling (deduplication, lowercasing)
 * - Preflight (OPTIONS) request handling with method and header validation
 * - Configurable preflight caching via `Access-Control-Max-Age`
 * - Automatic echo of `Access-Control-Request-Headers` when `allowHeaders` is not set
 * - Credentials support with automatic `*` to explicit origin conversion (CORS spec compliance)
 * - Private Network Access support (preflight requests from public to private networks)
 * - Cross-Origin-Opener-Policy (`same-origin`) and Cross-Origin-Embedder-Policy (`require-corp`) headers
 * - Error handling with CORS header preservation (`keepHeadersOnError`)
 * - Safe handling of non-Error throwables (primitives are wrapped in Error instances)
 * - Conditional skipping of CORS processing (`shouldSkip`)
 * - Zero external dependencies
 * - Full TypeScript support with dedicated types in the `Plugin` namespace
 *
 * @param options - Configuration options (see {@link Options})
 * @returns Koa middleware function
 * @see https://github.com/koajs/koa/blob/master/docs/guide.md#writing-middleware
 * @see https://github.com/nhankyjangchan/koa-cors
 */
export declare function cors(options?: Options): Middleware;
export default cors;
