import compose from 'koa-compose';

import status from './status';
import defaultRoute from './defaultRoute';
import assets from './assets';
import errorHandler from './errorHandler';

export default config => compose([
    status(config),
    errorHandler(config),
    // assets(config),
    defaultRoute(config)
]);
