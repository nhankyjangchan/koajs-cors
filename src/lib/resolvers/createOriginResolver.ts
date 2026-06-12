import type { Plugin } from '@lib/types';
import type { Context } from 'koa';

/**
 * @internal
 */
export function createOriginResolver(origin?: Plugin.Origin): Plugin.OriginResolver {
    const originType: string = typeof origin;
    const isOriginSet: boolean = origin instanceof Set;

    if (originType === 'string')
        return matchExactOrigin;
    else if (originType === 'function')
        return resolveDynamicOrigin;
    else if (isOriginSet)
        return matchOriginFromList;
    else return rejectRequest;

    function matchExactOrigin(ctx: Context, requestOrigin: string): string {
        if (origin !== requestOrigin && origin !== '*')
            ctx.throw(403);
        return origin;
    }

    async function resolveDynamicOrigin(ctx: Context): Promise<string> {
        const computeOrigin = origin as Plugin.ComputeOrigin;
        const computedOrigin: unknown = await computeOrigin(ctx);
        if (!computedOrigin)
            ctx.throw(403);
        return typeof computedOrigin === 'string' ? computedOrigin : ctx.throw(500);
    }

    function matchOriginFromList(ctx: Context, requestOrigin: string): string {
        const setOfOrigins = origin as Set<string>;
        if (!setOfOrigins.has(requestOrigin))
            ctx.throw(403);
        return requestOrigin;
    }

    function rejectRequest(ctx: Context): never {
        ctx.throw(500);
    }
}
