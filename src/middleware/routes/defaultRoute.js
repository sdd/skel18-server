import debug from 'debug';
const d = debug('defaultRoute');

// If none of the downstream middleware handle the response by explicitly setting
// the status, this route will render the default template. This is usually what
// you want in an SPA that handles it's own internal routing client-side.
export default ({ defaultRouteContent }) => async (ctx, next) => {

    ctx.res.statusCode = 0;
    await next();

    if (!ctx.status) {
        d('unhandled by downstream middleware');

        if (ctx.accepts('json', 'html') === 'json') {
            ctx.throw(404);
        }

        d('rendering default');

        ctx.body = defaultRouteContent;
        ctx.type = 'text/html; charset=utf-8';
    }
}
