import { addOriginToVary } from '@lib/utils/addOriginToVary';
import type { Plugin, Headers } from '@lib/types';

/**
 * @internal
 */
export function mergeHeadersWithError(headers: Headers, e: unknown): Plugin.E {
    const error: Plugin.E = e instanceof Error ? e : new Error(String(e));
    const existingErrorHeaders: Headers = error.headers || {};

    const { Vary, vary, ...errorHeaders } = existingErrorHeaders;

    const baseVary: string = Vary || vary || '';
    const mergedVary: string = addOriginToVary(baseVary);

    error.headers = {
        ...errorHeaders,
        ...headers,
        vary: mergedVary
    };

    return error;
}
