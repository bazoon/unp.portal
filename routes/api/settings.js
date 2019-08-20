const Router = require("koa-router");
const router = new Router();

router.get("/", (ctx, next) => {
  ctx.body = {
    unpUrl: process.env.UNP_URL,
    bpUrl: process.env.BP_URL
  };
});

router.use("/settings", router.routes());

module.exports = router;
