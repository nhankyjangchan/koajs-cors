import request from 'supertest';
import Koa from 'koa';
import { cors } from '../src/index.ts';
import type { Context } from 'koa';
import type { Response } from 'supertest';

describe('CORS middleware behavior', (): void => {
    let app: Koa;

    beforeEach((): void => {
        app = new Koa();
        app.use(
            cors({
                origin: 'http://koajs.com',
                credentials: true,
                allowMethods: ['HEAD', 'POST', 'GET', 'PATCH', 'PUT', 'DELETE'],
                allowHeaders: ['Authorization', 'X-Requested-With'],
                maxAge: 4_800,
                exposeHeaders: ['X-Powered-By', 'X-Response-Time'],
                keepHeadersOnError: true,
                shouldSkip: false
            })
        );
    });

    describe('behavior on preflight request', (): void => {
        it('should always add `Origin` field to `Vary` header on preflight request', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect('Vary', 'Origin');
        });

        it('should not set CORS headers if `Origin` request header not exists', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .expect('Vary', 'Origin')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    expect(res.headers['access-control-allow-methods']).toBeUndefined();
                    expect(res.headers['access-control-allow-headers']).toBeUndefined();
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                });
        });

        it('should not set CORS headers if `Access-Control-Request-Method` request header not exists', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .expect('Vary', 'Origin')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    expect(res.headers['access-control-allow-methods']).toBeUndefined();
                    expect(res.headers['access-control-allow-headers']).toBeUndefined();
                    expect(res.headers['access-control-max-age']).toBeUndefined();
                });
        });

        it('should set CORS headers on normal preflight request', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect('Vary', 'Origin')
                .expect('access-control-allow-origin', 'http://koajs.com')
                .expect('access-control-allow-credentials', 'true')
                .expect('access-control-allow-methods', 'HEAD,POST,GET,PATCH,PUT,DELETE')
                .expect('access-control-allow-headers', 'Authorization,X-Requested-With')
                .expect('access-control-max-age', '4800');
        });

        it('should send response with 204 status code on preflight request', async (): Promise<void> => {
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect('Vary', 'Origin')
                .expect(204);
        });

        it('should end middleware chain and send response when it is preflight request', async (): Promise<void> => {
            app.use((ctx: Context): never => {
                ctx.throw(500);
            });
            await request(app.callback())
                .options('/')
                .set('Origin', 'http://koajs.com')
                .set('Access-Control-Request-Method', 'PUT')
                .expect('Vary', 'Origin')
                .expect(204);
        });
    });

    describe('behavior on simple request', (): void => {
        it('should always add `Origin` field to `Vary` header on simple request', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Vary', 'Origin');
        });

        it('should not set CORS headers if `Origin` request header not exists', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .expect('Vary', 'Origin')
                .expect((res: Response): void => {
                    expect(res.headers['access-control-allow-origin']).toBeUndefined();
                    expect(res.headers['access-control-allow-credentials']).toBeUndefined();
                    expect(res.headers['access-control-expose-headers']).toBeUndefined();
                });
        });

        it('should set CORS headers on simple request', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Vary', 'Origin')
                .expect('access-control-allow-origin', 'http://koajs.com')
                .expect('access-control-allow-credentials', 'true')
                .expect('access-control-expose-headers', 'X-Powered-By,X-Response-Time');
        });

        it('should keep CORS headers after throwed error', async (): Promise<void> => {
            app.use((ctx: Context): never => {
                ctx.throw(500, 'Whoops! Options options.keepHeadersOnError is `TRUE`', {
                    headers: ctx.response.headers
                });
            });
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Vary', 'origin')
                .expect('access-control-allow-origin', 'http://koajs.com')
                .expect('access-control-allow-credentials', 'true')
                .expect('access-control-expose-headers', 'X-Powered-By,X-Response-Time')
                .expect(500);
        });

        it('should keep CORS headers when throwed not error via creating instance of Error', async (): Promise<void> => {
            app.use((_ctx: Context): never => {
                throw 1;
            });
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Vary', 'origin')
                .expect('access-control-allow-origin', 'http://koajs.com')
                .expect('access-control-allow-credentials', 'true')
                .expect('access-control-expose-headers', 'X-Powered-By,X-Response-Time')
                .expect(500);
        });
    });

    describe('specific case with option.origin and options.credentials', (): void => {
        const app = new Koa();
        app.use(cors({ origin: '*', credentials: true }));

        it('should set `Access-Control-Allow-Origin` to `Origin` request header when option.origin is `*` and options.credentials is `true`', async (): Promise<void> => {
            await request(app.callback())
                .get('/')
                .set('Origin', 'http://koajs.com')
                .expect('Access-Control-Allow-Origin', 'http://koajs.com')
                .expect('Access-Control-Allow-Credentials', 'true');
        });
    });
});
