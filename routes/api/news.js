const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jsonStream = require("JSONStream");

router.get("/list", (ctx, next) => {
  ctx.body = [];
});

module.exports = router;
