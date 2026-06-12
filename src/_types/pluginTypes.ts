import type { Context } from 'koa';

export interface Options {
    origin?: Plugin.Origin;
    credentials?: Plugin.Credentials;
    allowMethods?: string | string[];
    allowHeaders?: string | string[];
    maxAge?: string | number;
    exposeHeaders?: string | string[];
    privateNetworkAccess?: boolean;
    originOpenerPolicy?: boolean;
    originEmbedderPolicy?: boolean;
    keepHeadersOnError?: boolean;
    shouldSkip?: false | Plugin.Predicate;
}

export namespace Plugin {
    export type Origin = string | Set<string> | ComputeOrigin;
    export type ComputeOrigin = (ctx: Context) => string | Promise<string>;
    export type OriginResolver = (ctx: Context, requestOrigin: string) => string | Promise<string>;
    export type Credentials = boolean | Predicate;
    export type Predicate = (ctx: Context) => boolean | Promise<boolean>;
    export type Headers = Record<string, string | undefined>;
    export type E = Error & { headers?: Headers };
}
