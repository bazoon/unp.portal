const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const constants = require("../../utils/constants");
const getUploadFilePath = require("../../utils/getUploadFilePath");

router.get("/", async ctx => {
  const userId = ctx.user.id;
  const query = `select notifications.id, description, avatar, notifications.created_at from notifications 
                left join users on notifications.user_id = users.id
                where type = ${
                  constants.notifications.type.common
                } or recipient_id = ${userId}
                order by notifications.created_at desc`;

  const notifications = (await models.sequelize.query(query))[0];

  ctx.body = notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    description: n.description,
    avatar: getUploadFilePath(n.avatar),
    createdAt: n.created_at
  }));
});

module.exports = router;
