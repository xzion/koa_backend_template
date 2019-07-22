const router = require('koa-router')({
    prefix: '/api/auth'
});
const wins = require('winston');
const jwt = require('jsonwebtoken');

const mw = require('./middleware');
const errors = require('../custom_modules/errors');

router.use(mw.handleCustomErrors);


router.post('/login', async (ctx) => {
    wins.debug("Got login request");

    // Do actual verification with BCRYPT
    let userInfo = {
        id: 12345,
        name: 'test_user'
    };


    if (userInfo == null) {
        throw new errors.BadCredentials();
    }

    // Create a JWT
    let encodedJWT = jwt.sign(userInfo, process.env.JWT_SECRET);
    ctx.body = {
        token: encodedJWT
    };
});









module.exports = router;