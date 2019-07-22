const router = require('koa-router')({
    prefix: '/api'
});
const wins = require('winston');

const mw = require('./middleware');

router.use(mw.handleCustomErrors);
router.use(mw.verifyJWT);

router.get('/', async (ctx) => {
    ctx.body = "Hello World - GET /";
    wins.debug("Got /");
});

router.get('/test', async (ctx) => {
    ctx.body = "Hello World - GET /test";
    wins.debug("Got /test");
});

// This always goes last
router.all('/*', async (ctx) => {
    wins.error(`BAD API CALL: ${ctx.request.method} - ${ctx.request.originalUrl}`);
    ctx.body = `BAD API CALL: ${ctx.request.method} - ${ctx.request.originalUrl}`;
    ctx.response.status = 404;
});








module.exports = router;