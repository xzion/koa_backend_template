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
const path = require('path');
const cors = require('@koa/cors');
const bp = require('koa-bodyparser');

const app = new koa();
app.use(logger());
app.use(bp());
app.use(cors());


// Enforce HTTPS on heroku
let enforceHTTPS = async (ctx, next) => {
    if (ctx.get('x-forwarded-proto') != 'https') {
        wins.debug(`Got a http request, redirecting to https://${ctx.host}${ctx.path}`);
        ctx.status = 301;
        ctx.redirect(`https://${ctx.host}${ctx.path}`);
    } else {
        await next();
    }
};
if (process.env.NODE_ENV == 'production') {
    app.use(enforceHTTPS);
}


// Create the routes
let baseRoutes = require('./routes/index');
app.use(baseRoutes.routes());

// >>> /api/auth...
let authRoutes = require('./routes/api/auth');
app.use(authRoutes.routes());

// >>> /api... (with catchall)
let apiRoutes = require('./routes/api');
app.use(apiRoutes.routes());



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    wins.debug(`Server running on port ${PORT}`);
});
