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
  const query = `select notifications.id, description, avatar, notifications.created_at, seen from notifications 
                left join users on notifications.user_id = users.id
                left join seen_notifications on seen_notifications.notification_id = notifications.id
                where (type = :type or recipient_id = :userId)
                order by notifications.created_at desc`;

  const [notifications] = await models.sequelize.query(query, {
    replacements: {
      type: constants.notifications.type.common,
      userId
    }
  });

  ctx.body = notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    description: n.description,
    avatar: getUploadFilePath(n.avatar),
    createdAt: n.created_at,
    seen: n.seen
  }));
});

router.put("/seen/:id", async ctx => {
  const id = ctx.params.id;
  const userId = ctx.user.id;

  await models.SeenNotification.findOrCreate({
    where: {
      notificationId: id,
      userId
    },
    defaults: {
      notificationId: id,
      userId,
      seen: true
    }
  });

  ctx.body = "ok";
});

router.post("/seen", async ctx => {
  const userId = ctx.user.id;

  const notifications = models.Notification.findAll({
    where: {
      [Op.or]: [
        {
          recipientId: userId
        },
        {
          type: 0
        }
      ]
    }
  });

  await notifications.map(async notification => {
    return await models.SeenNotification.findOrCreate({
      where: {
        notificationId: notification.id,
        userId
      },
      defaults: {
        notificationId: notification.id,
        userId,
        seen: true
      }
    });
  });

  ctx.body = "ok";
});

module.exports = router;
