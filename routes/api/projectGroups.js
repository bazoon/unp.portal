const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/project_groups.json";
const models = require("../../models");
const multer = require("multer");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

function getGroups(userId, query, countQuery, res) {
  const promise = models.sequelize.query(query).then(function(groups) {
    return models.sequelize.query(countQuery).then(function(counts) {
      return groups[0].map(group => {
        return models.Participant.findOne({
          where: {
            [Op.and]: [{ UserId: userId }, { ProjectGroupId: group.id }]
          }
        }).then(participant => {
          const count = counts[0] && counts[0].find(c => c.id === group.id);
          return {
            id: group.id,
            isOpen: group.is_open,
            title: group.title,
            avatar: group.avatar,
            isOpen: group.is_open,
            count: (count && count.count) || 0,
            participant: participant !== null
          };
        });
      });
    });
  });
  // console.log(promises);
  promise.then(ps => {
    Promise.all(ps).then(r => {
      res.json(r);
    });
  });
}

router.get("/list", (req, res) => {
  const { userId } = req.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", is_open from
              "ProjectGroups"`;

  const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;
  getGroups(userId, query, countQuery, res);
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
  getGroups(userId, query, countQuery, res);
});

router.get("/list/created", (req, res) => {
  const { userId } = req.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", is_open from
              "ProjectGroups" where 
              ("ProjectGroups"."UserId"=${userId})`;

  const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;

  getGroups(userId, query, countQuery, res);
});

router.get("/get", (req, res) => {
  const { id } = req.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", "ProjectGroups"."is_open" from
              "ProjectGroups" where "ProjectGroups"."id" = ${id}`;
  const conversationsQuery = `select id, title from "Conversations" where "ProjectGroupId"=${id}`;

  const promises = models.sequelize.query(query).then(function(groups) {
    return models.sequelize
      .query(conversationsQuery)
      .then(function(conversations) {
        const group = groups[0][0];

        const linksPromise = models.ProjectGroupLink.findAll({
          where: { ProjectGroupId: group.id }
        });
        const docsPromise = models.ProjectGroupDoc.findAll({
          where: { ProjectGroupId: group.id }
        });
        const mediaPromise = models.ProjectGroupMedia.findAll({
          where: { ProjectGroupId: group.id }
        });
        const participantsPromise = models.Participant.findAll({
          where: { ProjectGroupId: group.id }
        });
        const adminsPromise = models.ProjectGroupAdmin.findAll({
          where: { ProjectGroupId: group.id }
        });

        return Promise.all([
          linksPromise,
          docsPromise,
          mediaPromise,
          participantsPromise,
          adminsPromise
        ]).then(results => {
          const participants = results[3];
          const admins = results[4];

          const participantsPromises = participants.map(participant => {
            return models.User.findAll({
              where: { id: participant.id }
            });
          });

          const participantsPromise = models.User.findAll({
            where: { id: { [Op.in]: participants.map(p => p.id) } }
          });

          const adminsPromise = models.User.findAll({
            where: { id: { [Op.in]: admins.map(p => p.id) } }
          });

          return Promise.all([participantsPromise, adminsPromise]).then(
            ([p, a]) => {
              return {
                id: group.id,
                isOpen: group.is_open,
                title: group.title,
                avatar: group.avatar,
                isOpen: group.is_open,
                conversations: conversations[0],
                links: results[0],
                docs: results[1],
                media: results[2],
                participants: p,
                admins: a
              };
            }
          );
        });
      });
  });

  promises.then(function(results) {
    res.json(results);
  });
});

router.post("/links/post", (req, res) => {
  const { link, title, id } = req.body;
  models.ProjectGroupLink.create({
    ProjectGroupId: id,
    link,
    title
  }).then(projectLink => {
    res.json(projectLink);
  });
});

router.post("/links/remove", (req, res) => {
  const { id } = req.body;
  models.ProjectGroupLink.destroy({ where: { id } }).then(() => {
    res.json({});
  });
});

router.post("/docs/post", upload.array("file", 12), function(req, res, next) {
  const { ProjectGroupId } = req.body;
  models.ProjectGroupDoc.bulkCreate(
    req.files.map(f => ({
      ProjectGroupId: ProjectGroupId,
      file: f.filename,
      size: f.size
    })),
    { returning: true }
  ).then(docs => {
    res.json(docs);
  });
});

router.post("/media/post", upload.array("file", 12), function(req, res, next) {
  const { ProjectGroupId } = req.body;
  models.ProjectGroupMedia.bulkCreate(
    req.files.map(f => ({
      ProjectGroupId: ProjectGroupId,
      file: f.filename,
      size: f.size
    })),
    { returning: true }
  ).then(media => {
    res.json(media);
  });
});

router.post("/docs/remove", (req, res) => {
  const { id } = req.body;
  models.ProjectGroupDoc.destroy({ where: { id } }).then(() => {
    res.json({});
  });
});

router.post("/media/remove", (req, res) => {
  const { id } = req.body;
  models.ProjectGroupMedia.destroy({ where: { id } }).then(() => {
    res.json({});
  });
});

router.post("/unsubscribe", (req, res) => {
  const { groupId, userId } = req.body;
  console.log(groupId, userId);
  models.Participant.destroy({
    where: {
      [Op.and]: [{ UserId: userId }, { ProjectGroupId: groupId }]
    }
  }).then(() => res.json({}));
});

router.post("/subscribe", (req, res) => {
  const { groupId, userId } = req.body;
  console.log(groupId, userId);
  models.Participant.create({
    ProjectGroupId: groupId,
    UserId: userId
  }).then(() => res.json({}));
});

module.exports = router;
