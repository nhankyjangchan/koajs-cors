import request from 'supertest';
import Koa from 'koa';
import cors from '../dist/index.mjs';
import type { Context, Next } from 'koa';
import type { Response } from 'supertest';

describe('CORS middleware', (): void => {
    describe('default options', (): void => {
        const app = new Koa();

        app.use(cors());
        app.use((ctx: Context): void => {
            ctx.body = { key: 'value' };
        });

        it('should not set `Access-Control-Allow-Origin` when Origin header is missing', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .expect(200)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });

        it('should set `Access-Control-Allow-Origin` to `*`', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Allow-Origin', '*')
                .expect({ key: 'value' });
        });

        it('should 204 on Preflight Request', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Origin', '*')
                .expect((res: Response): void => {
                    const allowMethods: string[] =
                        res.headers['access-control-allow-methods'].split(',');
                    const expectedMethods: string[] = [
                        'HEAD',
                        'POST',
                        'GET',
                        'PATCH',
                        'PUT',
                        'DELETE'
                    ];
                    expectedMethods.forEach((method: string): void =>
                        expect(allowMethods).toContain(method)
                    );
                });
        });

        it('should always set `Vary` to Origin', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Vary', 'Origin')
                .expect({ key: 'value' });
        });

        it('should always set `Vary` to Origin even when Origin header is missing', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .expect(200)
                .expect('Vary', 'Origin')
                .expect({ key: 'value' });
        });
    });

    describe('options.origin', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        describe('options.origin is "*"', (): void => {
            it('should set `Access-Control-Allow-Origin` to *', async (): Promise<void> => {
                app.use(cors());
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', '*')
                    .expect({ key: 'value' });
            });

            it('should not set `Access-Control-Allow-Origin` when Origin header is missing', async (): Promise<void> => {
                app.use(cors());
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect((res: Response): void => {
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    })
                    .expect({ key: 'value' });
            });
        });

        describe('options.origin is specific string', (): void => {
            it('should set `Access-Control-Allow-Origin` to the specific origin when matches', async (): Promise<void> => {
                app.use(cors({ origin: 'https://allowed.com' }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://allowed.com')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'https://allowed.com')
                    .expect({ key: 'value' });
            });

            it('should return 403 when Origin does not match', async (): Promise<void> => {
                app.use(cors({ origin: 'https://allowed.com' }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

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
            it('should set origin that is http://koajs.com', async (): Promise<void> => {
                app.use(cors({ origin: (): string => 'http://koajs.com' }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should async set origin that is http://koajs.com', async (): Promise<void> => {
                app.use(cors({ origin: async (): Promise<string> => 'http://koajs.com' }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should set `Access-Control-Allow-Origin` from `Origin`', async (): Promise<void> => {
                app.use(cors({ origin: (ctx: Context): string => ctx.get('Origin') }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should reject with 403', async (): Promise<void> => {
                app.use(cors({ origin: (): boolean => false }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(403)
                    .expect((res: Response): void => {
                        expect(res.header['vary']).toBeUndefined();
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });

        describe('origin is array', (): void => {
            it('should set `Access-Control-Allow-Origin` to the origin when matches allowed list', async (): Promise<void> => {
                app.use(cors({ origin: ['https://allowed1.com', 'http://koajs.com'] }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Vary', 'Origin')
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should not set `Access-Control-Allow-Origin` when Origin not in allowed list', async (): Promise<void> => {
                app.use(cors({ origin: ['https://allowed1.com', 'http://koajs.com'] }));
                app.use((ctx: Context): void => {
                    ctx.body = { key: 'value' };
                });

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
    });

    describe('options.allowMethods', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should work with allowMethods is string', async (): Promise<void> => {
            app.use(cors({ allowMethods: 'GET,POST' }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'GET,POST');
        });

        it('should work with allowMethods is array', async (): Promise<void> => {
            app.use(cors({ allowMethods: ['GET', 'POST'] }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'GET,POST');
        });

        it('should set default allowMethods when not provided', async (): Promise<void> => {
            app.use(cors());

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'HEAD,POST,GET,PATCH,PUT,DELETE');
        });

        it('should skip allowMethods', async (): Promise<void> => {
            app.use(cors({ allowMethods: null }));

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

    describe('options.exposeHeaders', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should work with exposeHeaders is string', async (): Promise<void> => {
            app.use(cors({ exposeHeaders: 'content-length' }));
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Expose-Headers', 'content-length')
                .expect({ foo: 'bar' });
        });

        it('should work with exposeHeaders is array', async (): Promise<void> => {
            app.use(cors({ exposeHeaders: ['content-length', 'x-header'] }));
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Expose-Headers', 'content-length,x-header')
                .expect({ foo: 'bar' });
        });

        it('should not set exposeHeaders by default', async (): Promise<void> => {
            app.use(cors());
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                })
                .expect({ foo: 'bar' });
        });

        it('should not set exposeHeaders when value is null', async (): Promise<void> => {
            app.use(cors({ exposeHeaders: null }));
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                })
                .expect({ foo: 'bar' });
        });
    });

    describe('options.allowHeaders', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should work with allowHeaders is string', async (): Promise<void> => {
            app.use(cors({ allowHeaders: 'X-PINGOTHER' }));
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-PINGOTHER');
        });

        it('should work with allowHeaders is array', async (): Promise<void> => {
            app.use(cors({ allowHeaders: ['X-PINGOTHER', 'X-CUSTOM'] }));
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-PINGOTHER,X-CUSTOM');
        });

        it('should set Access-Control-Allow-Headers to request Access-Control-Request-Headers header', async (): Promise<void> => {
            app.use(cors());
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .set('access-control-request-headers', 'X-PINGOTHER')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-PINGOTHER');
        });

        it('should use request headers when allowHeaders is null', async (): Promise<void> => {
            app.use(cors({ allowHeaders: null }));
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .set('access-control-request-headers', 'X-PINGOTHER')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-PINGOTHER');
        });
    });

    describe('options.maxAge', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should set default maxAge when not provided', async (): Promise<void> => {
            app.use(cors());

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '3600');
        });

        it('should set maxAge with number', async (): Promise<void> => {
            app.use(cors({ maxAge: 4800 }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '4800');
        });

        it('should set maxAge with string', async (): Promise<void> => {
            app.use(cors({ maxAge: '2400' }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '2400');
        });

        it('should not set maxAge when value is invalid', async (): Promise<void> => {
            app.use(cors({ maxAge: 'invalid' }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                });
        });

        it('should not set maxAge on simple request', async (): Promise<void> => {
            app.use(cors({ maxAge: '6600' }));
            app.use((ctx: Context): void => {
                ctx.body = { key: 'value' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });
    });

    describe('options.credentials', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        describe('options.credentials is "true"', (): void => {
            beforeEach((): void => {
                app.use(cors({ credentials: true }));
                app.use((ctx: Context): void => {
                    ctx.body = { foo: 'bar' };
                });
            });

            it('should enable Access-Control-Allow-Credentials on Simple request', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Credentials', 'true')
                    .expect({ foo: 'bar' });
            });

            it('should enable Access-Control-Allow-Credentials on Preflight request', async (): Promise<void> => {
                await request(app.callback())
                    .options('/')
                    .set('Origin', 'http://koajs.com')
                    .set('Access-Control-Request-Method', 'DELETE')
                    .expect(204)
                    .expect('Access-Control-Allow-Credentials', 'true');
            });
        });

        describe('options.credentials is "false"', (): void => {
            beforeEach(() => {
                app.use(cors({ credentials: false }));
                app.use((ctx: Context): void => {
                    ctx.body = { foo: 'bar' };
                });
            });

            it('should disable Access-Control-Allow-Credentials on Simple request', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect((res: Response): void => {
                        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    })
                    .expect({ foo: 'bar' });
            });

            it('should disable Access-Control-Allow-Credentials on Preflight request', async (): Promise<void> => {
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
            beforeEach((): void => {
                app.use(
                    cors({
                        credentials: (ctx: Context): boolean => ctx.get('X-Custom') === 'Koa'
                    })
                );
                app.use((ctx: Context): void => {
                    ctx.body = { foo: 'bar' };
                });
            });

            it('should enable Access-Control-Allow-Credentials on Simple request', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://site.com')
                    .set('X-Custom', 'Koa')
                    .expect(200)
                    .expect('Access-Control-Allow-Credentials', 'true')
                    .expect({ foo: 'bar' });
            });

            it('should disable Access-Control-Allow-Credentials when funtions returns falsy-value', async (): Promise<void> => {
                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://site.com')
                    .set('X-Custom', 'Express')
                    .expect(200)
                    .expect((res: Response): void => {
                        expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    })
                    .expect({ foo: 'bar' });
            });

            it('should enable Access-Control-Allow-Credentials on Preflight request', async (): Promise<void> => {
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

    describe('options.privateNetworkAccess', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
            app.use(cors({ privateNetworkAccess: true }));
            app.use((ctx: Context): void => {
                ctx.body = { key: 'value' };
            });
        });

        it('should not set on non-OPTIONS requests', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(200)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-private-network']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });

        it('should set when request header exists on OPTIONS', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .set('Access-Control-Request-Private-Network', 'true')
                .expect(204)
                .expect('Access-Control-Allow-Private-Network', 'true');
        });

        it('should NOT set when request header is missing on OPTIONS', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-private-network']).toBeUndefined();
                });
        });
    });

    describe('options.headersKeptOnError', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should keep CORS headers after an error', async (): Promise<void> => {
            app.use(cors({ keepHeadersOnError: true }));
            app.use((): never => {
                throw new Error('Whoops! Keep headers on error is on');
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(500)
                .expect('Access-Control-Allow-Origin', '*')
                .expect('Vary', 'Origin');
        });

        it('should not keep CORS headers after an error if keepHeadersOnError is false', async (): Promise<void> => {
            app.use(cors({ keepHeadersOnError: false }));
            app.use((): never => {
                throw new Error('Whoops! Keep headers on error is off');
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(500)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    expect(res.headers.vary).toBeUndefined();
                });
        });
    });

    describe('options.shouldSkip', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should NOT skip CORS', async (): Promise<void> => {
            app.use(
                cors({ shouldSkip: (ctx: Context): boolean => ctx.get('X-Custom') === 'Koa' })
            );
            app.use((ctx: Context): void => {
                ctx.body = { key: 'value' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .set('X-Custom', 'Experess')
                .expect(200)
                .expect('Access-Control-Allow-Origin', '*')
                .expect({ key: 'value' });
        });

        it('should skip CORS', async (): Promise<void> => {
            app.use(
                cors({ shouldSkip: (ctx: Context): boolean => ctx.get('X-Custom') === 'Koa' })
            );
            app.use((ctx: Context): void => {
                ctx.body = { key: 'value' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .set('X-Custom', 'Koa')
                .expect(200)
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });
    });

    describe('other middleware has been set `Vary` header to Accept-Encoding', (): void => {
        let app: Koa;

        beforeEach((): void => {
            app = new Koa();
        });

        it('should append `Vary` header to Origin', async (): Promise<void> => {
            app.use(async (ctx: Context, next: Next): Promise<void> => {
                ctx.set('Vary', 'Accept-Encoding');
                await next();
            });
            app.use(cors());
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Vary', 'Accept-Encoding, Origin')
                .expect({ foo: 'bar' });
        });

        it('should not duplicate Origin in Vary header', async (): Promise<void> => {
            app.use(async (ctx: Context, next: Next): Promise<void> => {
                ctx.set('Vary', 'Origin');
                await next();
            });
            app.use(cors());
            app.use((ctx: Context): void => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Vary', 'Origin')
                .expect({ foo: 'bar' });
        });
    });

    describe('options.origin=*, and options.credentials=true', (): void => {
        const app = new Koa();

        app.use(cors({ origin: '*', credentials: true }));
        app.use((ctx) => {
            ctx.body = { key: 'value' };
        });

        it('Access-Control-Allow-Origin should be request.origin, and Access-Control-Allow-Credentials should be true', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Allow-Credentials', 'true')
                .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                .expect({ key: 'value' });
        });
    });
});
