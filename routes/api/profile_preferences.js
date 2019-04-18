const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/profile_preferences.json";
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");

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

router.get("/get", (req, res) => {
  const { userId } = req.query;

  const groupsQuery = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id" from
       "ProjectGroups", "Participants" 
       where "ProjectGroups"."id" = "Participants"."ProjectGroupId" and
       "Participants"."UserId" = ${userId}`;

  const adminsQuery = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id" from
                      "ProjectGroups", "ProjectGroupAdmins" 
                      where "ProjectGroups"."id" = "ProjectGroupAdmins"."ProjectGroupId" and
                      "ProjectGroupAdmins"."UserId" = ${userId}`;

  models.User.findOne({ where: { id: userId } }).then(user => {
    models.sequelize.query(groupsQuery).then(groups => {
      models.sequelize.query(adminsQuery).then(adminGroups => {
        res.json({
          userId: user.id,
          userName: user.name,
          avatar: getUploadFilePath(user.avatar),
          position: user.Position,
          groups: groups[0],
          adminGroups: adminGroups[0]
        });
      });
    });
  });
});

router.get("/notifications", (req, res) => {
  const { userId } = req.query;

  const query = `select "ProjectGroups"."title", type, sms, push, email, "NotificationPreferences"."id" from
       "ProjectGroups", "NotificationPreferences" 
       where "ProjectGroups"."id" = "NotificationPreferences"."SourceId" and
       "NotificationPreferences"."UserId" = ${userId}
       order by id`;

  models.sequelize.query(query).then(preferences => {
    res.json(preferences[0]);
  });
});

router.post("/save", (req, res) => {
  const { id, type, value } = req.body;

  models.NotificationPreference.update(
    {
      [type]: value
    },
    {
      where: { id }
    }
  ).then(() => res.json({}));
});

router.post("/save/avatar", upload.array("file", 12), function(req, res, next) {
  const { userId } = req.body;
  const avatar = req.files && req.files[0].filename;

  models.User.update(
    {
      avatar: avatar
    },
    { where: { id: userId } }
  ).then(() =>
    res.json({
      avatar: getUploadFilePath(avatar)
    })
  );
});

module.exports = router;
