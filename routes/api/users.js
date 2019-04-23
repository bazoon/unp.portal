const Router = require("koa-router");
const router = new Router();
const models = require("../../models");

router.get("/list/all", async (ctx, next) => {
  const users = await models.User.findAll();
  ctx.body = users;
});

module.exports = router;
