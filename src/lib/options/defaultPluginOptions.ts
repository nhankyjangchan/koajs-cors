import type { Options } from '../../_types/pluginTypes.ts';

/**
 * @internal
 */
export const defaultPluginOptions: Options = {
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
