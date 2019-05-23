const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/profile_preferences.json";
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");

router.get("/get", async ctx => {
  const { userId } = ctx.request.query;

  const groupsQuery = `select project_groups.title, project_groups.avatar, project_groups.id from
       project_groups, participants 
       where project_groups.id = participants.project_group_id and
       participants.user_id = ${userId}`;

  const adminsQuery = `select project_groups.title, project_groups.avatar, project_groups.id from
                      project_groups, project_group_admins 
                      where project_groups.id = project_group_admins.project_group_id and
                      project_group_admins.user_id = ${userId}`;

  const result = await models.User.findOne({ where: { id: userId } }).then(
    user => {
      return models.sequelize.query(groupsQuery).then(groups => {
        return models.sequelize.query(adminsQuery).then(adminGroups => {
          return {
            userId: user.id,
            userName: user.name,
            avatar: getUploadFilePath(user.avatar),
            position: user.Position,
            groups: groups[0],
            adminGroups: adminGroups[0]
          };
        });
      });
    }
  );
  ctx.body = result;
});

router.get("/notifications", async ctx => {
  const { userId } = ctx.request.query;

  const query = `select project_groups.title, type, sms, push, email, notification_preferences.id from
       project_groups, notification_preferences 
       where project_groups.id = notification_preferences.source_id and
       notification_preferences.user_id = ${userId}
       order by id`;

  const result = await models.sequelize.query(query).then(preferences => {
    return preferences[0];
  });
  ctx.body = result;
});

router.post("/save", async ctx => {
  const { id, type, value } = ctx.request.body;

  const result = await models.NotificationPreference.update(
    {
      [type]: value
    },
    {
      where: { id }
    }
  );
  ctx.body = {};
});

router.post("/save/avatar", koaBody({ multipart: true }), async ctx => {
  const { userId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);
  const avatar = files[0] && files[0].name;

  const result = await models.User.update(
    {
      avatar: avatar
    },
    { where: { id: userId } }
  ).then(() => {
    return {
      avatar: getUploadFilePath(avatar)
    };
  });
  ctx.body = result;
});

module.exports = router;
