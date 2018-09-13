import Koa from 'koa';
import debug from 'debug';
import process from 'process';

import middleware from './middleware';

const d = debug('app');

const createApp = (config) => {

    d('CONFIG');
    d(config);
    const app = new Koa();

    app.use(middleware(config));

    //fix docker stop
    process.on('SIGINT', process.exit);
    process.on('SIGTERM', process.exit);

    return app;
};

export default createApp;

if (!module.parent) {

    const config = require('./config');
    const chalk = require('chalk');
    const app = createApp(config);

    app.listen(config.SERVER_PORT);
    console.log(chalk.green(`server listening on port ${config.SERVER_PORT}`));
} else {
    module.exports = app;
}
