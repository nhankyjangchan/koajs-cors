import { append } from 'vary';
import type { HttpError } from 'http-errors';
import type { Context, Next, Middleware } from 'koa';

export interface Options {
    origin?: string | string[] | ((ctx: Context) => string | Promise<string>);
    allowMethods?: string | string[];
    exposeHeaders?: string | string[];
    allowHeaders?: string | string[];
    maxAge?: string | undefined;
    credentials?: boolean;
    privateNetworkAccess?: boolean;
    originOpenerPolicy?: boolean;
    originEmbedderPolicy?: boolean;
    keepHeadersOnError?: boolean;
    shouldSkip?: undefined | false | ((ctx: Context) => boolean | Promise<boolean>);
}

type Headers = {
    [key: string]: string;
};

export default function cors(options: Options): Middleware {
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

    pluginOptions.maxAge = Number.isInteger(+pluginOptions.maxAge!)
        ? String(pluginOptions.maxAge)
        : undefined;

    async function resolveOrigin(requestOrigin: string, ctx: Context): Promise<string> {
        const originType: string = typeof pluginOptions.origin;
        if (originType === 'string')
            return matchOriginFromString(requestOrigin, ctx);
        else if (originType === 'function')
            return await computeOrigin(ctx);
        else if (Array.isArray(pluginOptions.origin))
            return matchOriginFromArray(requestOrigin, ctx);
        else ctx.throw(403);
    }

    function matchOriginFromString(requestOrigin: string, ctx: Context): string {
        if (pluginOptions.origin !== requestOrigin && pluginOptions.origin !== '*')
            ctx.throw(403);
        return pluginOptions.origin;
    }

    async function computeOrigin(ctx: Context): Promise<string> {
        const origin: string = await (pluginOptions.origin as Function)(ctx);
        if (!origin)
            ctx.throw(403);
        return origin;
    }

    function matchOriginFromArray(requestOrigin: string, ctx: Context): string {
        if (!(pluginOptions.origin as Array<string>).includes(requestOrigin))
            ctx.throw(403);
        return requestOrigin;
    }

    return async function (ctx: Context, next: Next): Promise<void> {
        ctx.vary('Origin');

        const requestOrigin: string = ctx.get('Origin');
        if (!requestOrigin)
            return await next();

        if (typeof pluginOptions.shouldSkip === 'function') {
            const shouldSkip: boolean = await pluginOptions.shouldSkip(ctx);
            if (shouldSkip)
                return await next();
        }

        let origin: string = await resolveOrigin(requestOrigin, ctx);

        if (pluginOptions.credentials && origin === '*')
            origin = requestOrigin;

        const corsHeaders: Headers = {};

        function applyHeader(key: string, value: string): void {
            ctx.set(key, value);
            corsHeaders[key] = value;
        }

        if (ctx.method !== 'OPTIONS') {
            applyHeader('Access-Control-Allow-Origin', origin);

            if (pluginOptions.exposeHeaders)
                applyHeader('Access-Control-Expose-Headers', pluginOptions.exposeHeaders as string);

            if (pluginOptions.credentials)
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
                const headersFromError: Headers = (err as HttpError)?.headers || {};
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

            if (pluginOptions.maxAge)
                ctx.set('Access-Control-Max-Age', pluginOptions.maxAge);

            if (pluginOptions.credentials)
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
