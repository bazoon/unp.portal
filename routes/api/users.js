const Router = require("koa-router");
const router = new Router();
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");

router.get("/list/all", async (ctx, next) => {
  const users = await models.User.findAll();
  ctx.body = users.map(u => {
    return {
      id: u.id,
      avatar: getUploadFilePath(u.avatar),
      Position: u.Position,
      name: u.name
    };
  });
});

module.exports = router;
