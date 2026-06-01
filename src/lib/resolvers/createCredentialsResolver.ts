import type { Options, Plugin } from '../../_types/pluginTypes.ts';
import type { Context } from 'koa';

/**
 * @internal
 */
export function createCredentialsResolver(pluginOptions: Options): Plugin.Predicate {
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
