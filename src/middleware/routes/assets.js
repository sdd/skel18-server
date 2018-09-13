import mount from 'koa-mount';
import files from 'koa-static';
import pixie from 'koa2-pixie-proxy';

export default config => mount('/assets',
    config.isDev && config.DEV_PROXY_ENABLED
        ? pixie({ host: config.DEV_PROXY_URL })()
        : files(config.PUBLIC_PATH)
)
