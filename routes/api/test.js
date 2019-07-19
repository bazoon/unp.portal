require("dotenv").config();
const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const models = require("../../models");

router.get("/clear", async ctx => {
  console.log("CLEAR");
  models.ProjectGroup.destroy({
    where: {}
  });
  // await models.sequelize.sync({ force: true });

  ctx.body = "ok";
});

module.exports = router;
