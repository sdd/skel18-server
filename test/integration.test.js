
import path from 'path';
import nock from 'nock'
import { expect } from 'chai';
import request from 'supertest';

import compose from 'koa-compose';
import Router from 'koa-router';
import App, {
    assets,
    defaultRoute,
    errorHandler,
    status
} from '../src';

const config = {
    isDev: true,
    DEV_PROXY_ENABLED: false,
    PUBLIC_PATH: path.join(__dirname, 'fixtures', 'assets'),
    SERVER_ROOT: path.join(__dirname, 'fixtures'),
    defaultRouteContent: '<!DOCTYPE html>'
};

const downstream = Router();

// some test middleware to simulate situations that can occur in downstream middleware
// in order to test that error-handler, assets, and default-route handle things correctly

downstream.get('/200-synchronous', ctx => {
    ctx.body = { a: 1 }
});

downstream.get('/200-asynchronous', async ctx => {
    ctx.body = await new Promise(resolve => {
        setTimeout(() => resolve({ a: 2 }), 1);
    });
});

downstream.get('/404', ctx => {
    ctx.throw(404);
});

downstream.get('/500', ctx => {
    ctx.throw(500);
});

const createServer = config => {
    return App(config)
    .use(compose([
        status(config),
        errorHandler(config),
        defaultRoute(config),
        assets(config),
        downstream.middleware()
    ]));
};

let app = createServer(config);

describe('integration', () => {

    describe('combination of assets, default-route, status, and error handler should behave as expected', () => {

        describe('matching downstream route that returns 200, synchronously', () => {
            it('should respond with status 200 and the body content from the downstream route', done => {
                request(app.listen())
                .get('/200-synchronous')
                .expect('Content-Type', /json/)
                .expect(200, { a: 1 }, done);
            });
        });

        describe('matching downstream route that returns 200, asynchronously', () => {
            it('should respond with status 200 and the body content from the downstream route', done => {
                request(app.listen())
                .get('/200-asynchronous')
                .expect('Content-Type', /json/)
                .expect(200, { a: 2 }, done);
            });
        });

        describe('Downstream routes that throw a 404 error', () => {

            it('should respond with status 404, and HTML 404 page if HTML requested', done => {
                request(app.listen())
                .get('/404')
                .set('Accept', 'text/html')
                .expect('Content-Type', /html/)
                .expect(404, 'HTML-404\n', done);
            });

            it('should respond with status 404, empty object, and type JSON if JSON requested', done => {
                request(app.listen())
                .get('/404')
                .set('Accept', 'application/json')
                .expect(404, {}, done)
            });
        });

        describe('Downstream routes that throw a 500 error', () => {

            it('should respond with status 500, and HTML 500 page if HTML requested', done => {
                request(app.listen())
                .get('/500')
                .set('Accept', 'text/html')
                .expect('Content-Type', /html/)
                .expect(500, 'HTML-500\n', done);
            });

            it('should respond with status 500, empty object, and type JSON if JSON requested', done => {
                request(app.listen())
                .get('/500')
                .set('Accept', 'application/json')
                .expect(500, {}, done);
            });

        });

        describe('No route match, non-asset path', () => {

            it('should respond with default route template if html', done => {
                request(app.listen())
                .get('/asfasdfsf')
                .set('Accept', 'text/html')
                .expect('Content-Type', /html/)
                .expect(200)
                .end((err, res) => {
                    expect(err).to.be.falsy;

                    expect(res.text).contains('<!DOCTYPE html>');
                    done();
                });
            });

            it('should respond with status 404 if json', done => {
                request(app.listen())
                .get('/asdfasdff')
                .set('Accept', 'application/json')
                .expect(404, {}, done);
            });
        });

        describe('Asset paths, no proxy', () => {

            it('should respond with asset if exists', done => {
                request(app.listen())
                .get('/assets/test.jpg')
                .expect('Content-Type', /jpeg/)
                .expect(200)
                .end(done);
            });

            it('should respond with status 404 if does not exist', done => {
                request(app.listen())
                .get('/assets/a-free-lunch.jpg')
                .expect(404, {}, done);
            });
        });

        describe('Asset paths, proxied', () => {

            beforeEach(() => {
                config.DEV_PROXY_ENABLED = true;
                config.DEV_PROXY_URL = 'http://localhost:54545';
                app = createServer(config);
            });

            it('should respond with asset if exists', done => {

                nock('http://localhost:54545')
                    .get('/exists')
                    .reply(200, { a:6 }, {
                        'Content-Type': 'application/json'
                    });

                request(app.listen())
                .get('/assets/exists')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(done);
            });

            it('should respond with status 404 if does not exist', done => {
                nock('http://localhost:54545')
                .get('/non-existent')
                .reply(404);

                request(app.listen())
                .get('/assets/non-existent')
                .expect(404)
                .end(done);
            });
        });
    });
});
