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
  const { userId, title, isOpen, description } = ctx.request.body;
  const { file } = ctx.request.files;

  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const result = await models.ProjectGroup.create({
    title: title,
    avatar: files && files[0] && files[0].name,
    is_open: isOpen,
    description: description
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

  const query = `select project_groups.title, project_groups.avatar, project_groups.id, is_open from
              project_groups`;

  const countQuery = `select project_groups.id, count(*) from project_groups, participants
                    where (project_groups.id = participants.project_group_id)
                    group by project_groups.id`;
  const groups = await getGroups(userId, query, countQuery);
  ctx.body = groups;
});

router.get("/list/my", async (ctx, next) => {
  const { userId } = ctx.request.query;

  const query = `select project_groups.title, project_groups.avatar, project_groups.id,is_open from
              project_groups, users, participants where (project_groups.id = participants.project_groupId) and
              (participants.user_id=users.id) and
              (participants.user_id=${userId})`;

  const countQuery = `select project_groups.id, count(*) from project_groups, participants
                    where (project_groups.id = participants.project_group_id)
                    group by project_groups.id`;
  const groups = await getGroups(userId, query, countQuery);
  ctx.body = groups;
});

router.get("/list/created", async (ctx, next) => {
  const { userId } = ctx.request.query;

  const query = `select project_groups.title, project_groups.avatar, project_groups.id, is_open from
                project_groups where 
                (project_groups.user_id=${userId})`;

  const countQuery = `select project_groups.id, count(*) from project_groups, participants
                    where (project_groups.id = participants.project_group_id)
                    group by project_groups.id`;

  const groups = await getGroups(userId, query, countQuery);
  ctx.body = groups;
});

router.get("/get", async (ctx, next) => {
  const { id } = ctx.request.query;
  const userId = ctx.user.id;

  const query = `select project_groups.title, project_groups.avatar, project_groups.id, 
              project_groups.is_open, project_groups.description from
              project_groups where project_groups.id = ${id}`;

  const conversationsQuery = `select conversations.id, title, count(posts.id), min(posts.created_at) as     lastPostDate, users."name", conversations."description", conversations."created_at" from conversations
                              left join posts
                              on conversations.id = posts.conversation_id
                              left join users 
                              on conversations."user_id" = users.id
                              where conversations.project_group_id = 1
                              group by conversations.id, users."name"
                              `;
  const participantsQuery = `select users."name", users."id" as user_id, participant_roles."name" as role_name, level, positions."name" as position, users."avatar"
                            from users, participants, participant_roles, positions where
                            (participants.project_group_id = ${id}) and (participants.participant_role_id = participant_roles.id) and 
                            (users.position_id = positions.id) and (participants.user_id = users.id)
                            order by level`;

  const groupResult = await models.sequelize.query(query);
  const group = groupResult[0][0];
  const conversationResult = await models.sequelize.query(conversationsQuery);
  const conversations = conversationResult[0];
  const participantsResult = await models.sequelize.query(participantsQuery);
  const participants = participantsResult[0];

  ctx.body = {
    id: group.id,
    isOpen: group.is_open,
    title: group.title,
    description: group.description,
    avatar: getUploadFilePath(group.avatar),
    isOpen: group.is_open,
    conversations: conversations,

    participants: participants.map(participant => {
      return {
        id: participant.id,
        userId: participant.userId,
        name: participant.name,
        position: participant.position,
        roleName: participant.role_name,
        level: participant.level,
        avatar: getUploadFilePath(participant.avatar)
      };
    }),
    participant: !!participants.find(
      participant => participant.user_id == userId
    )
  };
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
      [Op.and]: [{ user_id: userId }, { project_group_id: groupId }]
    }
  });

  const notificationPromise = models.NotificationPreference.destroy({
    where: { user_id: userId, source_id: groupId }
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

  const query = `select posts.id, posts.parent_id, text, users.name, 
                users.avatar, users.position_id, positions.name as position, posts.created_at
                from posts, users, positions
                where (group_id=${id}) and (posts.user_id = users.id) and (users.position_id = positions.id)
                order by posts.created_at asc`;

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
  const { projectGroupId, title, description } = ctx.request.body;
  const userId = ctx.user.id;
  const conversation = await models.Conversation.create({
    title,
    ProjectGroupId: projectGroupId,
    description,
    userId
  });
  ctx.body = {
    id: conversation.id,
    title: conversation.title,
    description: conversation.description,
    userId: conversation.userId,
    count: 0,
    lastpostdate: null
  };
});

module.exports = router;
