'use strict';

// Set up the winston logger
const wins = require('winston');
const safeStringify = require('fast-safe-stringify');
let log_level = "debug";
if (process.env.LOG_LEVEL) log_level = process.env.LOG_LEVEL;
const customPrinter = wins.format.printf((info) => {
    if (info instanceof Error) {
        if (info.name == "StatusCodeError") {
            let level = info.level;
            delete info.level;
            return `${level}: ${info.name}: ${info.message}\n${safeStringify(info, null, '  ')}`;
            info.message = JSON.stringify(info, null, '  ');
        } else {
            if (info.stack) {
                return `${info.level}: ${info.stack}`;
            } else {
                return `${info.level}: ${info.name} - ${info.message}`;
            }
        }
    } else {
        if (typeof info.message == 'object') {
            return `${info.level}: ${safeStringify(info.message, null, '  ')}`;
        } else {
            return `${info.level}: ${info.message}`;
        }
    }
});
wins.configure({
    format: customPrinter,
    transports: [new wins.transports.Console()],
    level: log_level
});


const koa = require('koa');
const logger = require('koa-logger');
const mount = require('koa-mount');
const path = require('path');


const app = new koa();
app.use(logger());


// Create the routes
let baseRoutes = require('./routes/index');
app.use(baseRoutes.routes());

let apiRoutes = require('./routes/api');
app.use(mount('/api', apiRoutes.routes()));


// Frontend redirect
const router = require('koa-router')();
if (process.env.NODE_ENV !== 'production') {
    app.use(require('koa-static')(path.join(__dirname, '..', 'frontend', 'dist')));
    const send = require('koa-send');
    router.get('/*', async function (ctx) {
        // Send the index for every GET request
        await send(ctx, 'index.html', {root: path.join(__dirname, '..', 'frontend', 'dist')});
    });
} else {
    // Production
    router.get('/*', async (ctx) => {
        wins.debug(`Got a random route: ${ctx.request.originalUrl}`) ;
        ctx.body = `Frontend redirect: ${ctx.request.originalUrl}`;
    });
}
app.use(router.routes());


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    wins.debug(`Server running on port ${PORT}`);
});