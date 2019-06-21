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

router.get("/", async (ctx, next) => {
  const users = await models.User.findAll({
    include: [
      {
        model: models.Position,
        as: "Position"
      },
      {
        model: models.Organization,
        as: "Organization"
      }
    ],
    order: [["name", "asc"]]
  });

  const u = users[0];
  ctx.body = users.map(u => {
    return {
      id: u.id,
      isAdmin: u.isAdmin,
      avatar: getUploadFilePath(u.avatar),
      name: u.name,
      login: u.login,
      position: u.Position,
      organization: u.Organization
    };
  });
});

module.exports = router;
