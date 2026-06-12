import request from 'supertest';
import Koa from 'koa';
import { cors } from '../../../src/index.ts';
import type { Context } from 'koa';
import type { Response } from 'supertest';
import type { Plugin } from '../../../src/_types/pluginTypes.ts';

describe('CORS middleware custom options', (): void => {
    describe('options.origin', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        describe('options.origin is specific string', (): void => {
            it('should set `Access-Control-Allow-Origin` to the specific origin when matches', async (): Promise<void> => {
                app.use(cors({ origin: 'https://allowed.com' }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://allowed.com')
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'https://allowed.com');
            });

            it('should reject request with 403 status code when `Origin` does not match', async (): Promise<void> => {
                app.use(cors({ origin: 'https://allowed.com' }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://not-allowed.com')
                    .expect(403)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });

        describe('options.origin is function', (): void => {
            it('should should set `Access-Control-Allow-Origin` to computed `http://koajs.com`', async (): Promise<void> => {
                app.use(cors({ origin: (): string => 'http://koajs.com' }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com');
            });

            it('should should set `Access-Control-Allow-Origin` to `http://koajs.com` via promise', async (): Promise<void> => {
                app.use(cors({ origin: async (): Promise<string> => 'http://koajs.com' }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com');
            });

            it('should set `Access-Control-Allow-Origin` from `Origin`', async (): Promise<void> => {
                app.use(cors({ origin: (ctx: Context): string => ctx.get('Origin') }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com');
            });

            it('should reject request with 403 status code when function does not return origin', async (): Promise<void> => {
                app.use(cors({ origin: (): string => '' }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(403)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });

            it('should reject request with 500 status code when function return uncorrect origin', async (): Promise<void> => {
                //@ts-ignore
                app.use(cors({ origin: (): Map<string, any> => new Map() }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(500)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });

        describe('options.origin is Set', (): void => {
            it('should set `Access-Control-Allow-Origin` to the origin when matches allowed list', async (): Promise<void> => {
                const origins = new Set(['https://allowed.com', 'http://koajs.com']);
                app.use(cors({ origin: origins }));

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com');
            });

            it('should reject request with 403 status code when `Origin` not in allowed list', async (): Promise<void> => {
                const origins = new Set(['https://allowed.com', 'http://koajs.com']);
                app.use(cors({ origin: origins }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://not-allowed.com')
                    .expect(403)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });

        describe('options.origin value is invalid', (): void => {
            it('should reject request with 500 status code when options.origin value type is invalid', async (): Promise<void> => {
                // @ts-ignore
                app.use(cors({ origin: [1, 2, 3] }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://not-allowed.com')
                    .expect(500)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });

            it('should reject request with 500 status code when options.origin is undefined', async (): Promise<void> => {
                // @ts-ignore
                app.use(cors({ origin: undefined }));
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://not-allowed.com')
                    .expect(500)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });
    });

    describe('options.credentials', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        describe('options.credentials is `true`', (): void => {
            beforeEach((): void => {
                app.use(cors({ credentials: true }));
            });

            it('should set `Access-Control-Allow-Credentials` on simple request', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect('Access-Control-Allow-Credentials', 'true');
            });

            it('should set `Access-Control-Allow-Credentials` on preflight request', async (): Promise<void> => {
                await request(app.callback())
                    .options('/')
                    .set('Origin', 'http://koajs.com')
                    .set('Access-Control-Request-Method', 'DELETE')
                    .expect(204)
                    .expect('Access-Control-Allow-Credentials', 'true');
            });
        });

        describe('options.credentials is `false`', (): void => {
            beforeEach((): void => {
                app.use(cors({ credentials: false }));
            });

            it('should not set `Access-Control-Allow-Credentials` on simple request', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect((res: Response): void => {
                        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    });
            });

            it('should not set `Access-Control-Allow-Credentials` on preflight request', async (): Promise<void> => {
                await request(app.callback())
                    .options('/')
                    .set('Origin', 'http://koajs.com')
                    .set('Access-Control-Request-Method', 'DELETE')
                    .expect(204)
                    .expect((res: Response): void => {
                        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    });
            });
        });

        describe('options.credentials is function', (): void => {
            const credentials: Plugin.Predicate = (ctx: Context): boolean =>
                ctx.get('X-Custom') === 'Koa';
            beforeEach((): void => {
                app.use(cors({ credentials }));
            });

            it('should set `Access-Control-Allow-Credentials` on simple request', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://site.com')
                    .set('X-Custom', 'Koa')
                    .expect('Access-Control-Allow-Credentials', 'true');
            });

            it('should not set `Access-Control-Allow-Credentials` when funtions returns falsy-value', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://site.com')
                    .set('X-Custom', 'Express')
                    .expect((res: Response): void => {
                        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    });
            });

            it('should set `Access-Control-Allow-Credentials` on preflight request', async (): Promise<void> => {
                await request(app.callback())
                    .options('/')
                    .set('Origin', 'https://site.com')
                    .set('Access-Control-Request-Method', 'DELETE')
                    .set('X-Custom', 'Koa')
                    .expect(204)
                    .expect('Access-Control-Allow-Credentials', 'true');
            });
        });
    });

    describe('options.allowMethods', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should set `Access-Control-Allow-Methods` when options.allowMethods is string', async (): Promise<void> => {
            app.use(cors({ allowMethods: 'GET,POST' }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'GET,POST');
        });

        it('should set `Access-Control-Allow-Methods` when options.allowMethods is array', async (): Promise<void> => {
            app.use(cors({ allowMethods: ['GET', 'POST'] }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'GET,POST');
        });

        it('should set `Access-Control-Allow-Methods` with default allow methods when options.allowMethods not provided', async (): Promise<void> => {
            app.use(cors());
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'HEAD,POST,GET,PATCH,PUT,DELETE');
        });

        it('should not set `Access-Control-Allow-Methods` when options.allowMethods is undefined', async (): Promise<void> => {
            app.use(cors({ allowMethods: undefined }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-methods']).toBeUndefined();
                });
        });
    });

    describe('options.allowHeaders', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should set `Access-Control-Allow-Headers` when options.allowHeaders is string', async (): Promise<void> => {
            app.use(cors({ allowHeaders: 'X-Api' }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-Api');
        });

        it('should set `Access-Control-Allow-Headers` when options.allowHeaders is array', async (): Promise<void> => {
            app.use(cors({ allowHeaders: ['X-Api', 'X-Custom'] }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-Api,X-Custom');
        });

        it('should set `Access-Control-Allow-Headers` from request `Access-Control-Request-Headers` header when options.allowHeaders is undefined', async (): Promise<void> => {
            app.use(cors());
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .set('Access-Control-Request-Headers', 'X-Api')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-Api');
        });
    });

    describe('options.maxAge', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should set `Access-Control-Max-Age` when options.maxAge is number', async (): Promise<void> => {
            app.use(cors({ maxAge: 4800 }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '4800');
        });

        it('should set `Access-Control-Max-Age` when options.maxAge is string', async (): Promise<void> => {
            app.use(cors({ maxAge: '2400' }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '2400');
        });

        it('should not set `Access-Control-Max-Age` when options.maxAge is invalid', async (): Promise<void> => {
            app.use(cors({ maxAge: 'NaN' }));
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                });
        });

        it('should not set `Access-Control-Max-Age` on not-preflight request', async (): Promise<void> => {
            app.use(cors({ maxAge: '6600' }));
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                });
        });
    });

    describe('options.exposeHeaders', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should set `Access-Control-Expose-Headers` when options.exposeHeaders is string', async (): Promise<void> => {
            app.use(cors({ exposeHeaders: 'content-length' }));
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Access-Control-Expose-Headers', 'content-length');
        });

        it('should set `Access-Control-Expose-Headers` when options.exposeHeaders is array', async (): Promise<void> => {
            app.use(cors({ exposeHeaders: ['content-length', 'x-header'] }));
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Access-Control-Expose-Headers', 'content-length,x-header');
        });

        it('should not set `Access-Control-Expose-Headers` by default', async (): Promise<void> => {
            app.use(cors());
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                });
        });

        it('should not set `Access-Control-Expose-Headers` when options.exposeHeaders is undefined', async (): Promise<void> => {
            app.use(cors({ exposeHeaders: undefined }));
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                });
        });
    });

    describe('options.keepHeadersOnError', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should keep CORS headers after an error when options.keepHeadersOnError is true', async (): Promise<void> => {
            app.use(
                cors({
                    origin: 'http://koajs.com',
                    credentials: true,
                    originOpenerPolicy: true,
                    keepHeadersOnError: true
                })
            );
            app.use((ctx: Context): never => {
                ctx.vary('Accept-Encoding');
                ctx.set('X-Api', 'Koa');
                ctx.throw(500, 'Whoops! Options options.keepHeadersOnError is `TRUE`', {
                    headers: ctx.response.headers
                });
            });
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(500)
                .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                .expect('Vary', 'origin, accept-encoding')
                .expect('Cross-Origin-Opener-Policy', 'same-origin')
                .expect('Access-Control-Allow-Credentials', 'true')
                .expect('X-Api', 'Koa');
        });

        it('should not keep CORS headers after an error when options.keepHeadersOnError is false', async (): Promise<void> => {
            app.use(cors({ keepHeadersOnError: false }));
            app.use((ctx: Context): never => {
                ctx.set('Vary', 'Accept-Encoding');
                ctx.throw(500, 'Whoops! Options options.keepHeadersOnError is `FALSE`');
            });
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(500)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    expect(res.headers['vary']).toBeUndefined();
                });
        });
    });

    describe('options.shouldSkip', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should NOT skip CORS when options.shouldSkip return false', async (): Promise<void> => {
            const shouldSkip: Plugin.Predicate = (ctx: Context): boolean =>
                ctx.get('X-Custom') === 'Koa';
            app.use(cors({ origin: 'http://koajs.com', shouldSkip }));
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .set('X-Custom', 'Fastify')
                .expect('Access-Control-Allow-Origin', 'http://koajs.com');
        });

        it('should skip CORS', async (): Promise<void> => {
            const shouldSkip: Plugin.Predicate = (ctx: Context): boolean =>
                ctx.get('X-Custom') === 'Koa';
            app.use(cors({ origin: 'http://koajs.com', shouldSkip }));
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .set('X-Custom', 'Koa')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                });
        });
    });
});
