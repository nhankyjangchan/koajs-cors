import { append } from 'vary';
import type { HttpError } from 'http-errors';
import type { Context, Next, Middleware } from 'koa';

export interface Options {
    origin?: string | string[] | Plugin.ComputeOrigin;
    allowMethods?: string | string[];
    exposeHeaders?: string | string[];
    allowHeaders?: string | string[];
    maxAge?: string | number;
    credentials?: boolean | Plugin.Predicate;
    privateNetworkAccess?: boolean;
    originOpenerPolicy?: boolean;
    originEmbedderPolicy?: boolean;
    keepHeadersOnError?: boolean;
    shouldSkip?: false | Plugin.Predicate;
}

export namespace Plugin {
    export type ComputeOrigin = (ctx: Context) => string | Promise<string>;
    export type Predicate = (ctx: Context) => boolean | Promise<boolean>;
    export type OriginResolver = (ctx: Context, requestOrigin: string) => string | Promise<string>;
    export type Headers = Record<string, string>;
}

export default function cors(options: Options = {}): Middleware {
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

    const pluginOptions: Options = {
        ...defaultOptions,
        ...options
    };

    if (Array.isArray(pluginOptions.allowMethods))
        pluginOptions.allowMethods = pluginOptions.allowMethods.join(',');

    if (Array.isArray(pluginOptions.exposeHeaders))
        pluginOptions.exposeHeaders = pluginOptions.exposeHeaders.join(',');

    if (Array.isArray(pluginOptions.allowHeaders))
        pluginOptions.allowHeaders = pluginOptions.allowHeaders.join(',');

    const maxAge: string | null = Number.isInteger(+pluginOptions.maxAge!)
        ? String(pluginOptions.maxAge)
        : null;

    const resolveOrigin: Plugin.OriginResolver = createOriginResolver();
    const resolveCredentials: Plugin.Predicate = createCredentialsResolver();

    function createOriginResolver(): Plugin.OriginResolver {
        const originType: string = typeof pluginOptions.origin;
        const isOriginArray: boolean = Array.isArray(pluginOptions.origin);

        if (originType === 'string')
            return matchOriginFromString;
        else if (originType === 'function')
            return computeOrigin;
        else if (isOriginArray)
            return matchOriginFromArray;
        else return rejectRequest;

        function matchOriginFromString(ctx: Context, requestOrigin: string): string {
            if (pluginOptions.origin !== requestOrigin && pluginOptions.origin !== '*')
                ctx.throw(403);
            return pluginOptions.origin as string;
        }

        async function computeOrigin(ctx: Context): Promise<string> {
            const origin: string = await (pluginOptions.origin as Function)(ctx);
            if (!origin)
                ctx.throw(403);
            return origin;
        }

        function matchOriginFromArray(ctx: Context, requestOrigin: string): string {
            if (!(pluginOptions.origin as Array<string>).includes(requestOrigin!))
                ctx.throw(403);
            return requestOrigin as string;
        }

        function rejectRequest(ctx: Context): never {
            ctx.throw(500);
        }
    }

    function createCredentialsResolver(): Plugin.Predicate {
        if (typeof pluginOptions.credentials === 'function')
            return computeCredentials;
        return staticCredentials;

        async function computeCredentials(ctx: Context): Promise<boolean> {
            return await (pluginOptions.credentials as Plugin.Predicate)(ctx);
        }

        function staticCredentials(): boolean {
            return pluginOptions.credentials as boolean;
        }
    }

    const isShouldSkipFunction: boolean = typeof pluginOptions.shouldSkip === 'function';

    return async function (ctx: Context, next: Next): Promise<void> {
        ctx.vary('Origin');

        const requestOrigin: string = ctx.get('Origin');
        if (!requestOrigin)
            return await next();

        if (isShouldSkipFunction) {
            const shouldSkip: boolean = await (pluginOptions.shouldSkip as Plugin.Predicate)(ctx);
            if (shouldSkip)
                return await next();
        }

        let origin: string = await resolveOrigin(ctx, requestOrigin);
        let credentials: boolean = await resolveCredentials(ctx);

        if (credentials && origin === '*')
            origin = requestOrigin;

        const corsHeaders: Plugin.Headers = {};

        function applyHeader(key: string, value: string): void {
            ctx.set(key, value);
            corsHeaders[key] = value;
        }

        if (ctx.method !== 'OPTIONS') {
            applyHeader('Access-Control-Allow-Origin', origin);

            if (pluginOptions.exposeHeaders)
                applyHeader('Access-Control-Expose-Headers', pluginOptions.exposeHeaders as string);

            if (credentials)
                applyHeader('Access-Control-Allow-Credentials', 'true');

            if (pluginOptions.originOpenerPolicy)
                applyHeader('Cross-Origin-Opener-Policy', 'same-origin');

            if (pluginOptions.originEmbedderPolicy)
                applyHeader('Cross-Origin-Embedder-Policy', 'require-corp');

            if (!pluginOptions.keepHeadersOnError)
                return await next();

            try {
                return await next();
            } catch (err: unknown) {
                const headersFromError: Plugin.Headers = (err as HttpError)?.headers || {};
                const baseVaryHeader: string = headersFromError['Vary'] || headersFromError['vary'] || '';
                const mergedVaryHeader: string = append(baseVaryHeader, 'Origin');

                delete headersFromError['Vary'];
                delete headersFromError['vary'];

                (err as HttpError).headers = {
                    ...headersFromError,
                    ...corsHeaders,
                    vary: mergedVaryHeader
                };

                throw err;
            }
        } else {
            const requestedMethod: string = ctx.get('Access-Control-Request-Method');
            if (!requestedMethod)
                return await next();

            ctx.set('Access-Control-Allow-Origin', origin);

            if (pluginOptions.allowMethods)
                ctx.set('Access-Control-Allow-Methods', pluginOptions.allowMethods);

            const requestedHeaders: string = ctx.get('Access-Control-Request-Headers');
            const allowHeaders: string = (pluginOptions.allowHeaders as string) || requestedHeaders;
            if (allowHeaders)
                ctx.set('Access-Control-Allow-Headers', allowHeaders);

            if (maxAge)
                ctx.set('Access-Control-Max-Age', maxAge);

            if (credentials)
                ctx.set('Access-Control-Allow-Credentials', 'true');

            const requestedPrivateNetwork: string = ctx.get('Access-Control-Request-Private-Network');
            if (pluginOptions.privateNetworkAccess && requestedPrivateNetwork)
                ctx.set('Access-Control-Allow-Private-Network', 'true');

            if (pluginOptions.originOpenerPolicy)
                ctx.set('Cross-Origin-Opener-Policy', 'same-origin');

            if (pluginOptions.originEmbedderPolicy)
                ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');

            ctx.status = 204;
        }
    };
}
