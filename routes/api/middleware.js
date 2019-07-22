const wins = require('winston');
const jwt = require('jsonwebtoken');
const errors = require('../custom_modules/errors');

// Environment check
if (!process.env.JWT_SECRET) {
    throw Error("Missing env variable JWT_SECRET!");
}

let mw = {
    verifyJWT: async function  (ctx, next) {
        let token = ctx.get('x-access-token');
        wins.debug("Access token: " + token);
        if (token == null) {
            throw new errors.NotLoggedIn();
        }

        // Verify the JWT
        try {
            let decodedJWT = jwt.verify(token, process.env.JWT_SECRET);
            ctx.jwt = decodedJWT;
        } catch (e) {
            console.log(e);
            throw new errors.NotLoggedIn();
        }

        next();
    },
    handleCustomErrors: async function (ctx, next) {
        try {
            await next();
        } catch (e) {
            wins.debug("In custom error handler");
            if (e instanceof errors.AppError) {
                wins.info(`Caught custom error: ${e.name} - ${e.message}`);
                // wins.info(e.stack);

                ctx.status = e.status;
                ctx.body = {
                    err: e.message
                };
            } else {
                throw e;
            }
        }
    },
};


module.exports = mw;