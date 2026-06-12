import type { Options } from '@lib/types';

/**
 * @internal
 */
export const defaultPluginOptions: Options = {
    origin: '*',
    credentials: false,
    allowMethods: ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE'],
    maxAge: '3600',
    privateNetworkAccess: false,
    originOpenerPolicy: false,
    originEmbedderPolicy: false,
    keepHeadersOnError: true,
    shouldSkip: false
};
