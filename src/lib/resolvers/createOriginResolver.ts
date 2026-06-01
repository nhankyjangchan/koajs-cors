import type { Options, Plugin } from '../../_types/pluginTypes.ts';
import type { Context } from 'koa';

/**
 * @internal
 */
export function createOriginResolver(pluginOptions: Options): Plugin.OriginResolver {
    const originType: string = typeof pluginOptions.origin;
    const isOriginSet: boolean = pluginOptions.origin instanceof Set;

    if (originType === 'string')
        return matchExactOrigin;
    else if (originType === 'function')
        return resolveDynamicOrigin;
    else if (isOriginSet)
        return matchOriginFromList;
    else return rejectRequest;

    function matchExactOrigin(ctx: Context, requestOrigin: string): string {
        if (pluginOptions.origin !== requestOrigin && pluginOptions.origin !== '*')
            ctx.throw(403);
        return pluginOptions.origin as string;
    }

    async function resolveDynamicOrigin(ctx: Context): Promise<string> {
        const origin: unknown = await (pluginOptions.origin as Function)(ctx);
        if (!origin)
            ctx.throw(403);
        return typeof origin === 'string' ? origin : ctx.throw(500);
    }

    function matchOriginFromList(ctx: Context, requestOrigin: string): string {
        if (!(pluginOptions.origin as Set<string>).has(requestOrigin))
            ctx.throw(403);
        return requestOrigin as string;
    }

    function rejectRequest(ctx: Context): never {
        ctx.throw(500);
    }
}
