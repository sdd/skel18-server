import send from 'koa-send';
import path from 'path';

const defaults = {
    stackSuppressedErrors: [ 304, 404 ],

    // eslint-disable-next-line no-console
    errorLogger: err => console.error(`ERROR: ${ err }`)
};

module.exports = opts => async (ctx, next) => {

    const {
        errorLogger,
        stackSuppressedErrors,
        SERVER_ROOT
    } = { ...defaults, ...opts };

    const root = path.join(SERVER_ROOT, 'static-error-pages');
    const sendOpts = { root };

    // wrap all downstream middleware in try/catch
    try {
        await next();
    } catch (err) {

        ctx.status = err.status || err.statusCode || 500;

        // if the thrown error is 304 not modified or 404 not found,
        // don't pollute the log with an unnecessary stacktrace.
        if (!stackSuppressedErrors.includes(ctx.status)) {
            errorLogger(err.stack);
        }

        // if the request was for html, and the response status
        // is 404 or 500, render an error page
        if (ctx.accepts('json', 'html') === 'json') {
            ctx.response.body = ctx.response.body || {};
        } else {

            const errorPage = ctx.status === 404 ? 404 : 500;

            await send(ctx, `error-${errorPage}.html`, sendOpts);
            ctx.response.type = 'html';
        }
    }
};
