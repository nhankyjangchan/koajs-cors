import request from 'supertest';
import Koa from 'koa';
import cors from '../dist/index.mjs';

describe('CORS middleware', () => {
    describe('default options', () => {
        const app = new Koa();

        app.use(cors());
        app.use((ctx) => {
            ctx.body = { key: 'value' };
        });

        it('should not set `Access-Control-Allow-Origin` when Origin header is missing', async () => {
            await request(app.callback())
                .get('/')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });

        it('should set `Access-Control-Allow-Origin` to `*`', async () => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Allow-Origin', '*')
                .expect({ key: 'value' });
        });

        it('should 204 on Preflight Request', async () => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Origin', '*')
                .expect((res) => {
                    const allowMethods = res.headers['access-control-allow-methods'].split(',');
                    const expectedMethods = ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE'];
                    expectedMethods.forEach((method) => expect(allowMethods).toContain(method));
                });
        });

        it('should always set `Vary` to Origin', async () => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Vary', 'Origin')
                .expect({ key: 'value' });
        });

        it('should always set `Vary` to Origin even when Origin header is missing', async () => {
            await request(app.callback())
                .get('/')
                .expect(200)
                .expect('Vary', 'Origin')
                .expect({ key: 'value' });
        });
    });

    describe('options.origin', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        describe('origin = "*"', () => {
            it('should set `Access-Control-Allow-Origin` to *', async () => {
                app.use(cors({ origin: '*' }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Origin', '*')
                    .expect({ key: 'value' });
            });

            it('should not set `Access-Control-Allow-Origin` when Origin header is missing', async () => {
                app.use(cors({ origin: '*' }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .expect(200)
                    .expect((res) => {
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    })
                    .expect({ key: 'value' });
            });
        });

        describe('origin = specific string', () => {
            it('should set `Access-Control-Allow-Origin` to the specific origin when matches', async () => {
                app.use(cors({ origin: 'https://allowed.com' }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://allowed.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Origin', 'https://allowed.com')
                    .expect({ key: 'value' });
            });

            it('should return 403 when Origin does not match', async () => {
                app.use(cors({ origin: 'https://allowed.com' }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://not-allowed.com')
                    .expect(403)
                    .expect((res) => {
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });

        describe('origin = function', () => {
            it('should set origin that is http://koajs.com', async () => {
                app.use(cors({ origin: () => 'http://koajs.com' }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should async set origin that is http://koajs.com', async () => {
                app.use(cors({ origin: async () => 'http://koajs.com' }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should set `Access-Control-Allow-Origin` from `Origin`', async () => {
                app.use(cors({ origin: (ctx) => ctx.get('Origin') }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should reject with 403', async () => {
                app.use(cors({ origin: (ctx) => false }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(403)
                    .expect(res => {
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });

        describe('origin = array', () => {
            it('should set `Access-Control-Allow-Origin` to the origin when matches allowed list', async () => {
                app.use(cors({ origin: ['https://allowed1.com', 'http://koajs.com'] }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'http://koajs.com')
                    .expect(200)
                    .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                    .expect({ key: 'value' });
            });

            it('should not set `Access-Control-Allow-Origin` when Origin not in allowed list', async () => {
                app.use(cors({ origin: ['https://allowed1.com', 'http://koajs.com'] }));
                app.use((ctx) => {
                    ctx.body = { key: 'value' };
                });

                await request(app.callback())
                    .get('/')
                    .set('Origin', 'https://not-allowed.com')
                    .expect(403)
                    .expect((res) => {
                        expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    });
            });
        });
    });

    describe('options.allowMethods', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        it('should work with allowMethods is string', async () => {
            app.use(cors({ allowMethods: 'GET,POST' }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'GET,POST');
        });

        it('should work with allowMethods is array', async () => {
            app.use(cors({ allowMethods: ['GET', 'POST'] }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'GET,POST');
        });

        it('should set default allowMethods when not provided', async () => {
            app.use(cors());

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Methods', 'HEAD,POST,GET,PATCH,PUT,DELETE');
        });

        it('should skip allowMethods', async () => {
            app.use(cors({ allowMethods: null }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res) => {
                    expect(res.headers['access-control-allow-methods']).toBeUndefined();
                });
        });
    });

    describe('options.exposeHeaders', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        it('should work with exposeHeaders is string', async () => {
            app.use(cors({ exposeHeaders: 'content-length' }));
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Expose-Headers', 'content-length')
                .expect({ foo: 'bar' });
        });

        it('should work with exposeHeaders is array', async () => {
            app.use(cors({ exposeHeaders: ['content-length', 'x-header'] }));
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Expose-Headers', 'content-length,x-header')
                .expect({ foo: 'bar' });
        });

        it('should not set exposeHeaders by default', async () => {
            app.use(cors());
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                })
                .expect({ foo: 'bar' });
        });

        it('should not set exposeHeaders when value is null', async () => {
            app.use(cors({ exposeHeaders: null }));
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                })
                .expect({ foo: 'bar' });
        });
    });

    describe('options.allowHeaders', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        it('should work with allowHeaders is string', async () => {
            app.use(cors({ allowHeaders: 'X-PINGOTHER' }));
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-PINGOTHER');
        });

        it('should work with allowHeaders is array', async () => {
            app.use(cors({ allowHeaders: ['X-PINGOTHER', 'X-CUSTOM'] }));
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Allow-Headers', 'X-PINGOTHER,X-CUSTOM');
        });

        it('should set Access-Control-Allow-Headers to request Access-Control-Request-Headers header', async () => {
            app.use(cors());
            app.use((ctx) => {
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

        it('should use request headers when allowHeaders is null', async () => {
            app.use(cors({ allowHeaders: null }));
            app.use((ctx) => {
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

    describe('options.maxAge', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        it('should set default maxAge when not provided', async () => {
            app.use(cors());

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '3600');
        });

        it('should set maxAge with number', async () => {
            app.use(cors({ maxAge: 4800 }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '4800');
        });

        it('should set maxAge with string', async () => {
            app.use(cors({ maxAge: '2400' }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect('Access-Control-Max-Age', '2400');
        });

        it('should not set maxAge when value is invalid', async () => {
            app.use(cors({ maxAge: 'invalid' }));

            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res) => {
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                });
        });

        it('should not set maxAge on simple request', async () => {
            app.use(cors({ maxAge: '6600' }));
            app.use((ctx) => {
                ctx.body = { key: 'value' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });
    });

    describe('options.credentials=true', () => {
        const app = new Koa();

        app.use(cors({ credentials: true }));
        app.use((ctx) => {
            ctx.body = { foo: 'bar' };
        });

        it('should enable Access-Control-Allow-Credentials on Simple request', async () => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Access-Control-Allow-Credentials', 'true')
                .expect({ foo: 'bar' });
        });

        it('should enable Access-Control-Allow-Credentials on Preflight request', async () => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'DELETE')
                .expect(204)
                .expect('Access-Control-Allow-Credentials', 'true');
        });
    });

    describe('options.credentials=false', () => {
        const app = new Koa();

        app.use(cors());
        app.use((ctx) => {
            ctx.body = { foo: 'bar' };
        });

        it('should disable Access-Control-Allow-Credentials on Simple request', async () => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                })
                .expect({ foo: 'bar' });
        });

        it('should disable Access-Control-Allow-Credentials on Preflight request', async () => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'DELETE')
                .expect(204)
                .expect((res) => {
                    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                });
        });
    });

    describe('options.privateNetworkAccess', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
            app.use(cors({ privateNetworkAccess: true }));
            app.use((ctx) => {
                ctx.body = { key: 'value' };
            });
        });

        it('should not set on non-OPTIONS requests', async () => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(200)
                .expect((res) => {
                    expect(res.headers['access-control-allow-private-network']).toBeUndefined();
                })
                .expect({ key: 'value' });
        });

        it('should set when request header exists on OPTIONS', async () => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .set('Access-Control-Request-Private-Network', 'true')
                .expect(204)
                .expect('Access-Control-Allow-Private-Network', 'true');
        });

        it('should NOT set when request header is missing on OPTIONS', async () => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect(204)
                .expect((res) => {
                    expect(res.headers['access-control-allow-private-network']).toBeUndefined();
                });
        });
    });

    describe('options.headersKeptOnError', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        it('should keep CORS headers after an error', async () => {
            app.use(cors({ keepHeadersOnError: true }));
            app.use(() => {
                throw new Error('Whoops! Keep headers on error is on');
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(500)
                .expect('Access-Control-Allow-Origin', '*')
                .expect('Vary', 'Origin');
        });

        it('should not keep CORS headers after an error if keepHeadersOnError is false', async () => {
            app.use(cors({ keepHeadersOnError: false }));
            app.use(() => {
                throw new Error('Whoops! Keep headers on error is off');
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(500)
                .expect((res) => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    expect(res.headers.vary).toBeUndefined();
                });
        });
    });

    describe('other middleware has been set `Vary` header to Accept-Encoding', () => {
        let app;

        beforeEach(() => {
            app = new Koa();
        });

        it('should append `Vary` header to Origin', async () => {
            app.use(async (ctx, next) => {
                ctx.set('Vary', 'Accept-Encoding');
                await next();
            });
            app.use(cors());
            app.use((ctx) => {
                ctx.body = { foo: 'bar' };
            });

            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect(200)
                .expect('Vary', 'Accept-Encoding, Origin')
                .expect({ foo: 'bar' });
        });

        it('should not duplicate Origin in Vary header', async () => {
            app.use(async (ctx, next) => {
                ctx.set('Vary', 'Origin');
                await next();
            });
            app.use(cors());
            app.use((ctx) => {
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

    describe('options.origin=*, and options.credentials=true', () => {
        const app = new Koa();

        app.use(cors({ origin: '*', credentials: true }));
        app.use((ctx) => {
            ctx.body = { key: 'value' };
        });

        it('Access-Control-Allow-Origin should be request.origin, and Access-Control-Allow-Credentials should be true', async () => {
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
