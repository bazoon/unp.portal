const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/profile_preferences.json";
const models = require("../../models");

router.get("/get", (req, res) => {
  const { userId } = req.query;
  console.log(777, userId);

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

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.post("/save", (req, res) => {
  const { key, sms, push, email } = req.body;
  fs.readFile(fileName, function(err, text) {
    const content = JSON.parse(text);
    const row = content.find(r => r.key == key);
    console.log(sms, push, email);
    console.log(row);
    row.sms = sms;
    row.push = push;
    row.email = email;
    console.log(row);
    // console.log(content);
    fs.writeFile(fileName, JSON.stringify(content), function(err) {
      res.json("ok");
    });
  });
});

module.exports = router;
