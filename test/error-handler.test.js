'use strict';
import chai, { expect } from 'chai';
import { spy } from 'sinon';
import sinonChai from 'sinon-chai';
import request from 'supertest';
import Koa from 'koa';
import errorHandler from '../src/middleware/routes/errorHandler';

chai.use(sinonChai);

describe('errorHandler', () => {

    it('does nothing when downstream has no errors', (done) => {

        const config = {
            SERVER_ROOT: 'test/fixtures',
            errorLogger: spy()
        };

        const app = new Koa();
        app.use(errorHandler(config));
        app.use((ctx, next) => {
            ctx.status = 200;
            next();
        });

        request(app.listen())
        .get('/')
        .expect(200, done);
    });

    it('returns json for JSON req errors', (done) => {

        const config = {
            SERVER_ROOT: 'test/fixtures',
            errorLogger: spy()
        };

        const app = new Koa();
        app.use(errorHandler(config));
        app.use((ctx) => {
            ctx.throw(503);
        });

        request(app.listen())
        .get('/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(503)
        .end(() => {

            expect(config.errorLogger).to.have.been.called;

            done();
        });
    });

    it('does not output the stacktrace for 304 errors', (done) => {

        const config = {
            SERVER_ROOT: 'test/fixtures',
            errorLogger: spy()
        };

        const app = new Koa();
        app.use(errorHandler(config));
        app.use((ctx) => {
            ctx.throw(404);
        });

        request(app.listen())
        .get('/')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(404)
        .end(() => {

            expect(config.errorLogger).not.to.have.been.called;

            done();
        });
    });

    it('returns html 404 for HTML 404 errors', (done) => {

        const config = {
            SERVER_ROOT: 'test/fixtures',
            errorLogger: spy()
        };

        const app = new Koa();
        app.use(errorHandler(config));
        app.use((ctx) => {
            ctx.throw(404);
        });

        request(app.listen())
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(404)
        .end((err, res) => {

            expect(res.text).to.equal('HTML-404\n');

            done();
        });

    });

    it('returns html 500 for HTML non-404 errors', (done) => {

        const config = {
            SERVER_ROOT: 'test/fixtures',
            errorLogger: spy()
        };

        const app = new Koa();
        app.use(errorHandler(config));
        app.use((ctx) => {
            ctx.throw(50);
        });

        request(app.listen())
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', /html/)
        .expect(500)
        .end((err, res) => {

            expect(res.text).to.equal('HTML-500\n');

            done();
        });

    });
});

