const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/project_groups.json";
const models = require("../../models");
const multer = require("multer");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const getUploadFilePath = require("../../utils/getUploadFilePath");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.post("/create", upload.array("file", 12), function(req, res, next) {
  const { userId, groupTitle, isOpen, groupDescription } = req.body;
  const files = req.files;

  models.ProjectGroup.create({
    title: groupTitle,
    avatar: files && files[0] && files[0].filename,
    is_open: isOpen,
    description: groupDescription
  }).then(group => {
    models.Participant.create({
      ProjectGroupId: group.id,
      UserId: userId
    }).then(() => res.json({}));
  });
});

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
            avatar: getUploadFilePath(group.avatar),
            isOpen: group.is_open,
            count: (count && +count.count) || 0,
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
  const { id, userId } = req.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", 
              "ProjectGroups"."is_open", "ProjectGroups"."description" from
              "ProjectGroups" where "ProjectGroups"."id" = ${id}`;
  const conversationsQuery = `select "Conversations"."id", title, count(*) from "Conversations"
                              left join "Posts"
                              on "Conversations"."id" = "Posts"."ConversationId"
                              where "Conversations"."ProjectGroupId" = ${id}
                              group by "Conversations"."id"
                              `;

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

          const usersPromise = models.User.findAll({
            where: { id: { [Op.in]: participants.map(p => p.UserId) } }
          });

          const adminsPromise = models.User.findAll({
            where: { id: { [Op.in]: admins.map(p => p.id) } }
          });

          return Promise.all([usersPromise, adminsPromise]).then(
            ([users, a]) => {
              return {
                id: group.id,
                isOpen: group.is_open,
                title: group.title,
                description: group.description,
                avatar: getUploadFilePath(group.avatar),
                isOpen: group.is_open,
                conversations: conversations[0],
                links: results[0],
                docs: results[1],
                media: results[2],
                participants: users.map(u => {
                  return {
                    id: u.id,
                    name: u.name,
                    avatar: getUploadFilePath(u.avatar)
                  };
                }),
                participant: !!users.find(user => user.id == userId),
                admins: a.map(u => {
                  return {
                    id: u.id,
                    name: u.name,
                    avatar: getUploadFilePath(u.avatar)
                  };
                })
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

  const participantPromise = models.Participant.destroy({
    where: {
      [Op.and]: [{ UserId: userId }, { ProjectGroupId: groupId }]
    }
  });

  const notificationPromise = models.NotificationPreference.destroy({
    where: { UserId: userId, SourceId: groupId }
  });

  Promise.all([participantPromise, notificationPromise]).then(() => {
    res.json({});
  });
});

router.post("/subscribe", (req, res) => {
  const { groupId, userId } = req.body;

  const participantPromise = models.Participant.create({
    ProjectGroupId: groupId,
    UserId: userId
  });

  const notificationPromise = models.NotificationPreference.create({
    type: "Группа",
    SourceId: groupId,
    UserId: userId,
    sms: false,
    push: false,
    email: false
  });

  Promise.all([participantPromise, notificationPromise]).then(() => {
    res.json({});
  });
});

router.get("/get/posts", (req, res) => {
  const { id } = req.query;

  const query = `select "Posts"."id", "Posts"."ParentId", text, "Users"."name", 
                "Users"."avatar", "Users"."Position", "Posts"."createdAt"
                from "Posts", "Users"
                where ("GroupId"=${id}) and ("Posts"."UserId" = "Users"."id")
                order by "Posts"."createdAt" desc`;

  models.sequelize.query(query).then(function(posts) {
    const promises = posts[0].map(post => {
      return models.PostFile.findAll({ where: { PostId: post.id } }).then(
        postFiles => {
          return {
            id: post.id,
            parentId: post.ParentId,
            text: post.text,
            avatar: getUploadFilePath(post.avatar),
            userName: post.name,
            position: post.Position,
            createdAt: post.createdAt,
            files: postFiles.map(pf => ({
              name: pf.file,
              size: pf.size
            }))
          };
        }
      );
    });

    const postsLookup = {};

    Promise.all(promises).then(posts => {
      posts.forEach(post => {
        postsLookup[post.id] = post;
      });

      const postsTree = posts.reduce((acc, post) => {
        if (post.parentId) {
          const parentPost = postsLookup[post.parentId];
          parentPost.children = parentPost.children || [];
          parentPost.children.push(post);
          return acc;
        }
        return acc.concat([post]);
      }, []);

      res.json(postsTree);
    });
  });
});

router.post("/post/post", upload.array("file", 12), function(req, res, next) {
  const { text, groupId, userId, postId } = req.body;
  const files = req.files;

  models.Post.create({
    text,
    GroupId: groupId,
    UserId: userId,
    ParentId: postId
  }).then(post => {
    models.PostFile.bulkCreate(
      files.map(f => ({ PostId: post.id, file: f.filename, size: f.size }))
    ).then(() => {
      const query = `select "Users"."name", "Users"."avatar", "Users"."Position"
                from "Users"
                where "Users"."id"=${userId}`;

      models.sequelize.query(query).then(function(users) {
        const user = users[0][0];
        res.json({
          id: post.id,
          parentId: post.ParentId,
          text: post.text,
          avatar: getUploadFilePath(user.avatar),
          userName: user.name,
          position: user.Position,
          createdAt: post.createdAt,
          files: files.map(f => ({ name: f.filename, size: f.size }))
        });
      });
    });
  });
});

module.exports = router;
