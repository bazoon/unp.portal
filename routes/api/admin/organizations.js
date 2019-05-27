const Router = require("koa-router");
const router = new Router();
const models = require("../../../models");

router.get("/", async (ctx, next) => {
  ctx.body = await models.Organization.findAll();
});

router.post("/create", async (ctx, next) => {
  const { name, inn } = ctx.request.body;
  const organization = await models.Organization.create({
    name,
    inn
  });

  ctx.body = {
    id: organization.id,
    name,
    inn
  };
});

router.post("/update", async (ctx, next) => {
  const { id, name, inn } = ctx.request.body;
  const organization = await models.Organization.findOne({
    where: {
      id
    }
  });

  await organization.update({
    name,
    inn
  });

  ctx.body = {
    id: organization.id,
    name,
    inn
  };
});

module.exports = router;
