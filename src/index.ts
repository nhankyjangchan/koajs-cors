import { defaultPluginOptions } from '@lib/options/defaultPluginOptions';
import { createOriginResolver } from '@lib/resolvers/createOriginResolver';
import { createCredentialsResolver } from '@lib/resolvers/createCredentialsResolver';
import { normalizeMaxAge } from '@lib/utils/normalizeMaxAge';
import { mergeHeadersWithError } from '@lib/utils/mergeHeadersWithError';
import type { Options, Plugin } from '@lib/types';
import type { Context, Next, Middleware } from 'koa';

export function cors(options: Options = {}): Middleware {
    const pluginOptions: Options = {
        ...defaultPluginOptions,
        ...options
    };

    if (Array.isArray(pluginOptions.allowMethods))
        pluginOptions.allowMethods = pluginOptions.allowMethods.join(',');

    if (Array.isArray(pluginOptions.exposeHeaders))
        pluginOptions.exposeHeaders = pluginOptions.exposeHeaders.join(',');

    if (Array.isArray(pluginOptions.allowHeaders))
        pluginOptions.allowHeaders = pluginOptions.allowHeaders.join(',');

    const resolveOrigin: Plugin.OriginResolver = createOriginResolver(pluginOptions.origin);
    const resolveCredentials: Plugin.Predicate = createCredentialsResolver(pluginOptions.credentials);

    const maxAge: string | null = normalizeMaxAge(pluginOptions.maxAge);
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
        const credentials: boolean = await resolveCredentials(ctx);

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
            } catch (e: unknown) {
                throw mergeHeadersWithError(corsHeaders, e);
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

export default cors;
