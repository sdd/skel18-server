'use strict';
import { expect } from 'chai';

import App from '../src';

describe('app', () => {

    it('works', () => {

        const app = App();

        expect(app).to.exist;
    });
});

