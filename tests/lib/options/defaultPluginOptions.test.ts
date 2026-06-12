import request from 'supertest';
import Koa from 'koa';
import { cors } from '../../../src/index';
import { defaultPluginOptions } from '../../../src/lib/options/defaultPluginOptions';
import type { Context } from 'koa';

describe('CORS middleware default options', (): void => {
    let app: Koa;

    beforeEach((): void => {
        app = new Koa();
        app.use(cors(defaultPluginOptions));
    });

    it('should set `Access-Control-Allow-Origin` to `*`', async (): Promise<void> => {
        await request(app.callback())
            .get('/')
            .set('Origin', 'http://koajs.com')
            .expect('Access-Control-Allow-Origin', '*');
    });

    it('should set default `Access-Control-Allow-Methods` on preflight request', async (): Promise<void> => {
        await request(app.callback())
            .options('/')
            .set('Origin', 'http://koajs.com')
            .set('Access-Control-Request-Method', 'PUT')
            .expect('Access-Control-Allow-Methods', 'HEAD,POST,GET,PATCH,PUT,DELETE');
    });

    it('should set default `Access-Control-Max-Age` on preflight request', async (): Promise<void> => {
        await request(app.callback())
            .options('/')
            .set('Origin', 'http://koajs.com')
            .set('Access-Control-Request-Method', 'PUT')
            .expect('Access-Control-Max-Age', '3600');
    });

    it('should keep CORS headers after an error on simple request', async (): Promise<void> => {
        app.use(async (ctx: Context): Promise<void> => {
            ctx.throw(500);
        });
        await request(app.callback())
            .get('/')
            .set('Origin', 'http://koajs.com')
            .expect('Vary', 'origin')
            .expect('Access-Control-Allow-Origin', '*')
            .expect(500);
    });
});
