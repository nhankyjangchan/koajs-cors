import { defaultPluginOptions } from '@lib/options/defaultPluginOptions';
import { createOriginResolver } from '@lib/resolvers/createOriginResolver';
import { createCredentialsResolver } from '@lib/resolvers/createCredentialsResolver';
import { normalizeMaxAge } from '@lib/utils/normalizeMaxAge';
import { applyHeader } from '@lib/utils/applyHeader';
import { mergeHeadersWithError } from '@lib/utils/mergeHeadersWithError';
import type { Options, Plugin, Headers } from '@lib/types';
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

    const {
        origin,
        credentials,
        allowMethods,
        allowHeaders,
        maxAge,
        exposeHeaders,
        privateNetworkAccess,
        originOpenerPolicy,
        originEmbedderPolicy,
        keepHeadersOnError,
        shouldSkip
    } = pluginOptions;

    const resolveOrigin: Plugin.OriginResolver = createOriginResolver(origin);
    const resolveCredentials: Plugin.Predicate = createCredentialsResolver(credentials);

    const normalizedMaxAge: string | null = normalizeMaxAge(maxAge);
    const isShouldSkipDefined: boolean = typeof shouldSkip === 'function';

    return async function (ctx: Context, next: Next): Promise<void> {
        ctx.vary('Origin');

        const requestOrigin: string = ctx.get('Origin');
        if (!requestOrigin)
            return next();

        if (isShouldSkipDefined) {
            const pendingSkip: boolean | Promise<boolean> = (shouldSkip as Plugin.Predicate)(ctx);
            const resolvedSkip: boolean = pendingSkip instanceof Promise ? await pendingSkip : pendingSkip;
            if (resolvedSkip)
                return next();
        }

        let resolvedOrigin: string = await resolveOrigin(ctx, requestOrigin);
        const resolvedCredentials: boolean = await resolveCredentials(ctx);

        if (resolvedCredentials && resolvedOrigin === '*')
            resolvedOrigin = requestOrigin;

        const headers: Headers = {};

        if (ctx.method !== 'OPTIONS') {
            applyHeader(ctx, headers, 'Access-Control-Allow-Origin', resolvedOrigin);

            if (exposeHeaders)
                applyHeader(ctx, headers, 'Access-Control-Expose-Headers', exposeHeaders);

            if (resolvedCredentials)
                applyHeader(ctx, headers, 'Access-Control-Allow-Credentials', 'true');

            if (originOpenerPolicy)
                applyHeader(ctx, headers, 'Cross-Origin-Opener-Policy', 'same-origin');

            if (originEmbedderPolicy)
                applyHeader(ctx, headers, 'Cross-Origin-Embedder-Policy', 'require-corp');

            if (!keepHeadersOnError)
                return next();

            try {
                return await next();
            } catch (e: unknown) {
                throw mergeHeadersWithError(headers, e);
            }
        } else {
            const requestedMethod: string = ctx.get('Access-Control-Request-Method');
            if (!requestedMethod)
                return next();

            ctx.set('Access-Control-Allow-Origin', resolvedOrigin);

            if (allowMethods)
                ctx.set('Access-Control-Allow-Methods', allowMethods);

            const requestedHeaders: string = ctx.get('Access-Control-Request-Headers');
            const allowedHeaders: string = allowHeaders || requestedHeaders;
            if (allowedHeaders)
                ctx.set('Access-Control-Allow-Headers', allowedHeaders);

            if (normalizedMaxAge)
                ctx.set('Access-Control-Max-Age', normalizedMaxAge);

            if (resolvedCredentials)
                ctx.set('Access-Control-Allow-Credentials', 'true');

            const requestedPrivateNetwork: string = ctx.get('Access-Control-Request-Private-Network');
            if (privateNetworkAccess && requestedPrivateNetwork)
                ctx.set('Access-Control-Allow-Private-Network', 'true');

            if (originOpenerPolicy)
                ctx.set('Cross-Origin-Opener-Policy', 'same-origin');

            if (originEmbedderPolicy)
                ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');

            ctx.status = 204;
        }
    };
}

export default cors;
