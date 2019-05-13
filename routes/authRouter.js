const Router = require("koa-router");
const router = new Router();

const user = require("./api/user");
router.use("/api/user", user.routes());

module.exports = router;
