const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/profile_preferences.json";
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");

const multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get("/get", async ctx => {
  const { userId } = ctx.request.query;

  const groupsQuery = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id" from
       "ProjectGroups", "Participants" 
       where "ProjectGroups"."id" = "Participants"."ProjectGroupId" and
       "Participants"."UserId" = ${userId}`;

  const adminsQuery = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id" from
                      "ProjectGroups", "ProjectGroupAdmins" 
                      where "ProjectGroups"."id" = "ProjectGroupAdmins"."ProjectGroupId" and
                      "ProjectGroupAdmins"."UserId" = ${userId}`;

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

  const query = `select "ProjectGroups"."title", type, sms, push, email, "NotificationPreferences"."id" from
       "ProjectGroups", "NotificationPreferences" 
       where "ProjectGroups"."id" = "NotificationPreferences"."SourceId" and
       "NotificationPreferences"."UserId" = ${userId}
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
