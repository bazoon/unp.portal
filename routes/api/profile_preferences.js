const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/profile_preferences.json";
const models = require("../../models");

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
          id: user.id,
          name: user.name,
          avatar: user.avatar,
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

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.post("/save", (req, res) => {
  const { id, type, value } = req.body;
  console.log(id, type, value);

  models.NotificationPreference.update(
    {
      [type]: value
    },
    {
      where: { id }
    }
  ).then(() => res.json({}));
});

module.exports = router;
