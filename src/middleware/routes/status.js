const Router = require('koa-router');

module.exports = config => {

    const router = Router();

    router.get('/meta', ctx => {

        const { uptime, env } = process;
        const up = uptime();

        ctx.body = {
            env: config.env || env.NODE_ENV,
            uptime: {
                seconds: up,
                humanReadable: `${Math.floor(up / 60 / 60)}h ${Math.floor(up / 60 % 60)}m`
            },
            version: require('../../../package.json').version
        };
    });

    return router.middleware();
};
