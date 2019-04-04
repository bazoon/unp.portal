const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/project_groups.json";
const models = require("../../models");

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.get("/list/my", (req, res) => {
  const { userId } = req.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id",is_open from
              "ProjectGroups", "Users", "Participants" where ("ProjectGroups"."id" = "Participants"."ProjectGroupId") and
              ("Participants"."UserId"="Users".id) and
              ("Participants"."UserId"=${userId})`;

  const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;

  models.sequelize.query(query).then(function(groups) {
    models.sequelize.query(countQuery).then(function(counts) {
      res.json(
        groups[0].map(group => {
          const count = counts[0].find(c => c.id === group.id);

          return {
            id: group.id,
            title: group.title,
            avatar: group.avatar,
            isOpen: group.is_open,
            count: count.count
          };
        })
      );
    });
  });
});

router.get("/list/created", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(
      jsonStream.parse("*", function(g) {
        if (g.id >= 2) {
          return g;
        }
      })
    )
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.get("/get", (req, res) => {
  // const projectGroupId
  const { id } = req.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id",is_open from
              "ProjectGroups" where "ProjectGroups"."id" = ${id}`;
  const conversationsQuery = `select id, title from "Conversations" where "ProjectGroupId"=${id}`;

  models.sequelize.query(query).then(function(groups) {
    models.sequelize.query(conversationsQuery).then(function(conversations) {
      res.json(
        groups[0].map(group => {
          return {
            id: group.id,
            title: group.title,
            avatar: group.avatar,
            isOpen: group.is_open,
            conversations: conversations[0]
          };
        })
      );
    });
  });
});

module.exports = router;
