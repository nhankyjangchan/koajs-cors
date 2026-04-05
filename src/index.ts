import { append } from 'vary';
import { HttpError } from 'http-errors';
import type { Context, Next, Middleware } from 'koa';

export interface Options {
    origin?: string | string[];
    allowMethods?: string | string[];
    exposeHeaders?: string | string[];
    allowHeaders?: string | string[];
    maxAge?: string | undefined;
    credentials?: boolean;
    privateNetworkAccess?: boolean;
    originOpenerPolicy?: boolean;
    originEmbedderPolicy?: boolean;
    keepHeadersOnError?: boolean;
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
        keepHeadersOnError: true
    };

    const pluginOptions: Options = {
        ...defaultOptions,
        ...options
    };

    const doesOriginExist: boolean = !!pluginOptions.origin && pluginOptions.origin?.length > 0;
    if (doesOriginExist === false)
        pluginOptions.origin = '*';

    if (Array.isArray(pluginOptions.allowMethods))
        pluginOptions.allowMethods = pluginOptions.allowMethods.join(',');

    if (Array.isArray(pluginOptions.exposeHeaders))
        pluginOptions.exposeHeaders = pluginOptions.exposeHeaders.join(',');

    if (Array.isArray(pluginOptions.allowHeaders))
        pluginOptions.allowHeaders = pluginOptions.allowHeaders.join(',');

    pluginOptions.maxAge = Number.isInteger(+pluginOptions.maxAge!)
        ? String(pluginOptions.maxAge)
        : undefined;

    return async function (ctx: Context, next: Next): Promise<void> {
        ctx.vary('Origin');

        const requestOrigin: string = ctx.get('Origin');
        if (!requestOrigin)
            return await next();

        let origin: string;

        if (Array.isArray(pluginOptions.origin)) {
            if (!pluginOptions.origin.includes(requestOrigin))
                ctx.throw(403);
            origin = requestOrigin;
        } else if (typeof pluginOptions.origin === 'string') {
            origin = pluginOptions.origin;
        } else ctx.throw(403);

        if (pluginOptions.credentials && origin === '*')
            origin = requestOrigin;

        const corsHeaders: Headers = {};

        function setHeader(key: string, value: string): void {
            ctx.set(key, value);
            corsHeaders[key] = value;
        }

        if (ctx.method !== 'OPTIONS') {
            setHeader('Access-Control-Allow-Origin', origin);

            if (pluginOptions.exposeHeaders)
                setHeader('Access-Control-Expose-Headers', pluginOptions.exposeHeaders as string);

            if (pluginOptions.credentials)
                setHeader('Access-Control-Allow-Credentials', 'true');

            if (pluginOptions.originOpenerPolicy)
                setHeader('Cross-Origin-Opener-Policy', 'same-origin');

            if (pluginOptions.originEmbedderPolicy)
                setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

            if (!pluginOptions.keepHeadersOnError)
                return await next();

            try {
                return await next();
            } catch (err: unknown) {
                const errorHeaders: Headers = (err as HttpError)?.headers || {};
                const vary: string = append(errorHeaders['vary'] || errorHeaders['Vary'] || '', 'Origin');

                if (err instanceof HttpError)
                    err.headers = { ...errorHeaders, ...corsHeaders, vary };
                else (err as HttpError).headers = { ...corsHeaders, vary };

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
