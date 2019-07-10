const Router = require("koa-router");
const router = new Router();
const models = require("../../../models");

router.get("/", async (ctx, next) => {
  ctx.body = await models.Position.findAll();
});

router.post("/", async (ctx, next) => {
  const { name } = ctx.request.body;
  const position = await models.Position.create({
    name
  });

  ctx.body = {
    id: position.id,
    name
  };
});

router.put("/", async (ctx, next) => {
  const { id, name } = ctx.request.body;
  const position = await models.Position.findOne({
    where: {
      id
    }
  });

  await position.update({
    name
  });

  ctx.body = {
    id: position.id,
    name
  };
});

module.exports = router;
