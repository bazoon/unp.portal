const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/project_groups.json";
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");
const { createPost, getPosts } = require("./common/posts");

router.post("/create", koaBody({ multipart: true }), async ctx => {
  const { userId, groupTitle, isOpen, groupDescription } = ctx.request.body;
  const { file } = ctx.request.files;
  console.log(userId, groupTitle, isOpen);
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const result = await models.ProjectGroup.create({
    title: groupTitle,
    avatar: files && files[0] && files[0].name,
    is_open: isOpen,
    description: groupDescription
  }).then(group => {
    return models.Participant.create({
      ProjectGroupId: group.id,
      UserId: userId
    });
  });
  ctx.body = result;
});

function getGroups(userId, query, countQuery) {
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

  return promise.then(ps => {
    return Promise.all(ps);
  });
}

router.get("/list", async (ctx, next) => {
  const { userId } = ctx.request.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", is_open from
              "ProjectGroups"`;

  const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;
  const groups = await getGroups(userId, query, countQuery);
  ctx.body = groups;
});

router.get("/list/my", async (ctx, next) => {
  const { userId } = ctx.request.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id",is_open from
              "ProjectGroups", "Users", "Participants" where ("ProjectGroups"."id" = "Participants"."ProjectGroupId") and
              ("Participants"."UserId"="Users".id) and
              ("Participants"."UserId"=${userId})`;

  const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;
  const groups = await getGroups(userId, query, countQuery);
  ctx.body = groups;
});

router.get("/list/created", async (ctx, next) => {
  const { userId } = ctx.request.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", is_open from
              "ProjectGroups" where 
              ("ProjectGroups"."UserId"=${userId})`;

  const countQuery = `select "ProjectGroups"."id", count(*) from "ProjectGroups", "Participants"
                    where ("ProjectGroups"."id" = "Participants"."ProjectGroupId")
                    group by "ProjectGroups"."id"`;

  const groups = await getGroups(userId, query, countQuery);
  ctx.body = groups;
});

router.get("/get", async (ctx, next) => {
  const { id, userId } = ctx.request.query;

  const query = `select "ProjectGroups"."title", "ProjectGroups"."avatar", "ProjectGroups"."id", 
              "ProjectGroups"."is_open", "ProjectGroups"."description" from
              "ProjectGroups" where "ProjectGroups"."id" = ${id}`;
  const conversationsQuery = `select "Conversations"."id", title, count("Posts"."id"), min("Posts"."createdAt") as lastPostDate from "Conversations"
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

  const group = await promises;
  ctx.body = group;
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

// router.post("/docs/post", upload.array("file", 12), function(req, res, next) {
//   const { ProjectGroupId } = req.body;
//   models.ProjectGroupDoc.bulkCreate(
//     req.files.map(f => ({
//       ProjectGroupId: ProjectGroupId,
//       file: f.filename,
//       size: f.size
//     })),
//     { returning: true }
//   ).then(docs => {
//     res.json(docs);
//   });
// });

// router.post("/media/post", upload.array("file", 12), function(req, res, next) {
//   const { ProjectGroupId } = req.body;
//   models.ProjectGroupMedia.bulkCreate(
//     req.files.map(f => ({
//       ProjectGroupId: ProjectGroupId,
//       file: f.filename,
//       size: f.size
//     })),
//     { returning: true }
//   ).then(media => {
//     res.json(media);
//   });
// });

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

router.post("/unsubscribe", async ctx => {
  const { groupId, userId } = ctx.request.body;

  const participantPromise = models.Participant.destroy({
    where: {
      [Op.and]: [{ UserId: userId }, { ProjectGroupId: groupId }]
    }
  });

  const notificationPromise = models.NotificationPreference.destroy({
    where: { UserId: userId, SourceId: groupId }
  });

  const result = await Promise.all([participantPromise, notificationPromise]);
  ctx.body = result;
});

router.post("/subscribe", async ctx => {
  const { groupId, userId } = ctx.request.body;

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

  const result = await Promise.all([participantPromise, notificationPromise]);
  ctx.body = result;
});

router.get("/get/posts", async (ctx, next) => {
  const { id } = ctx.request.query;

  const query = `select "Posts"."id", "Posts"."ParentId", text, "Users"."name", 
                "Users"."avatar", "Users"."PositionId","Positions"."name" as "Position", "Posts"."createdAt"
                from "Posts", "Users", "Positions"
                where ("GroupId"=${id}) and ("Posts"."UserId" = "Users"."id") and ("Users"."PositionId" = "Positions"."id")
                order by "Posts"."createdAt" asc`;

  ctx.body = await getPosts({ query });
});

router.post("/post/post", koaBody({ multipart: true }), async ctx => {
  const { text, groupId, userId, postId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];

  ctx.body = await createPost({
    text,
    groupId,
    userId,
    postId,
    files
  });
});

router.post("/conversation/create", async ctx => {
  const { projectGroupId, title } = ctx.request.body;
  const conversation = await models.Conversation.create({
    title,
    ProjectGroupId: projectGroupId
  });
  ctx.body = {
    id: conversation.id,
    title: conversation.title,
    count: 0,
    lastpostdate: null
  };
});

module.exports = router;
