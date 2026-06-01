import { mergeVaryWithOrigin } from './mergeVaryWithOrigin.ts';
import type { Plugin } from '../../_types/pluginTypes.ts';

/**
 * @internal
 */
export function mergeErrorHeaders(error: unknown, corsHeaders: Plugin.Headers): Plugin.E {
    const errorHeaders: Plugin.Headers = (error as Plugin.E)?.headers || {};

    const baseVary: string = errorHeaders['Vary'] || errorHeaders['vary'] || '';
    const mergedVary: string = mergeVaryWithOrigin(baseVary);

    delete errorHeaders['Vary'];
    delete errorHeaders['vary'];

    (error as Plugin.E).headers = {
        ...errorHeaders,
        ...corsHeaders,
        vary: mergedVary
    };

    return error as Plugin.E;
}
