import type { Context } from 'koa';

export interface Options {
    origin?: string | Set<string> | Plugin.ComputeOrigin;
    allowMethods?: string | string[];
    exposeHeaders?: string | string[];
    allowHeaders?: string | string[];
    maxAge?: string | number;
    credentials?: boolean | Plugin.Predicate;
    privateNetworkAccess?: boolean;
    originOpenerPolicy?: boolean;
    originEmbedderPolicy?: boolean;
    keepHeadersOnError?: boolean;
    shouldSkip?: false | Plugin.Predicate;
}

export namespace Plugin {
    export type ComputeOrigin = (ctx: Context) => string | Promise<string>;
    export type Predicate = (ctx: Context) => boolean | Promise<boolean>;
    export type OriginResolver = (ctx: Context, requestOrigin: string) => string | Promise<string>;
    export type Headers = Record<string, string>;
    export type E = Error & { headers: Headers };
}
