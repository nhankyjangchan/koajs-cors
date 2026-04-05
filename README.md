# @nhankyjangchan/koajs-cors

[![npm version](https://img.shields.io/npm/v/@nhankyjangchan/koajs-cors)](https://www.npmjs.com/package/@nhankyjangchan/koajs-cors)
[![npm downloads](https://img.shields.io/npm/dm/@nhankyjangchan/koajs-cors)](https://www.npmjs.com/package/@nhankyjangchan/koajs-cors)
[![license](https://img.shields.io/npm/l/@nhankyjangchan/koajs-cors)](https://github.com/nhankyjangchan/koajs-cors/blob/main/LICENSE)

[Cross-Origin Resource Sharing(CORS)](https://developer.mozilla.org/en/docs/Web/HTTP/Access_control_CORS) for KoaJS written in TypeScript

## Installation

```bash
$ npm i @nhankyjangchan/koajs-cors
```

or

```bash
$ bun add @nhankyjangchan/koajs-cors
```

## Options

```ts
/**
 * CORS middleware configuration options.
 */
export interface Options {
    /**
     * Configure the `Access-Control-Allow-Origin` header.
     *
     * @default '*'
     * @example
     * origin: 'https://example.com'
     * origin: ['https://example.com', 'https://another.com']
     */
    origin?: string | string[];

    /**
     * Configure the `Access-Control-Allow-Methods` header.
     *
     * @default 'HEAD,POST,GET,PATCH,PUT,DELETE'
     */
    allowMethods?: string | string[];

    /**
     * Configure the `Access-Control-Expose-Headers` header.
     */
    exposeHeaders?: string | string[];

    /**
     * Configure the `Access-Control-Allow-Headers` header.
     */
    allowHeaders?: string | string[];

    /**
     * Configure the `Access-Control-Max-Age` header (in seconds).
     *
     * @default '3600'
     */
    maxAge?: string | undefined;

    /**
     * Configure the `Access-Control-Allow-Credentials` header.
     *
     * @default false
     */
    credentials?: boolean;

    /**
     * Enable Private Network Access handling.
     * Adds `Access-Control-Allow-Private-Network` header for preflight requests.
     *
     * @default false
     */
    privateNetworkAccess?: boolean;

    /**
     * Enable Cross-Origin-Opener-Policy header.
     * Sets `Cross-Origin-Opener-Policy: same-origin`.
     *
     * @default false
     */
    originOpenerPolicy?: boolean;

    /**
     * Enable Cross-Origin-Embedder-Policy header.
     * Sets `Cross-Origin-Embedder-Policy: require-corp`.
     *
     * @default false
     */
    originEmbedderPolicy?: boolean;

    /**
     * Keep CORS headers when an error is thrown.
     * Headers are attached to `err.headers`.
     *
     * @default true
     */
    keepHeadersOnError?: boolean;
}
```

## Default options

```ts
/**
 * CORS middleware default configuration options.
 */
const defaultOptions: Options = {
        origin: '*',
        allowMethods: ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE'],
        maxAge: '3600',
        credentials: false,
        privateNetworkAccess: false,
        originOpenerPolicy: false,
        originEmbedderPolicy: false,
        keepHeadersOnError: true
    };
```

## Usage

```js
import Koa from 'koa';
import cors from '@nhankyjangchan/koajs-cors';

const app = new Koa();

app.use(
    cors({
        origin: ['https://example.com', 'https://another.com'],
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        maxAge: '3600'
    })
);

app.listen(3000);
```

## License

[MIT](./LICENSE)
