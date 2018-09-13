'use strict';
import { expect } from 'chai';
import request from 'supertest';

import App from '../src';

describe('app', () => {

    it('returns a Koa instance', () => {

        const app = App();
        expect(app).to.exist;
        expect(app.listen).to.be.a.function;
        expect(app.constructor.name).to.equal('Application');
    });

    it('defaults to a 404 response', (done) => {

        const app = App();

        request(app.listen())
        .get('/')
        .expect(404, done);
    });
});

