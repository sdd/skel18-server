import compose from 'koa-compose';

import logger from 'koa-logger';
import routes from './routes';

export default config => compose([
    logger(),
    routes(config)
]);
