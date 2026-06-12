import type { Plugin } from '@lib/types';
import type { Context } from 'koa';

/**
 * @internal
 */
export function createCredentialsResolver(credentials?: Plugin.Credentials): Plugin.Predicate {
    if (typeof credentials === 'function')
        return resolveDynamicCredentials;
    return staticCredentials;

    async function resolveDynamicCredentials(ctx: Context): Promise<boolean> {
        const computeCredentials = credentials as Plugin.Predicate;
        return await computeCredentials(ctx);
    }

    function staticCredentials(): boolean {
        return !!credentials;
    }
}
