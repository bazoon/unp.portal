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
const notificationService = require("../../utils/notifications");

router.post("/", koaBody({ multipart: true }), async ctx => {
  const userId = ctx.user.id;
  const {
    title,
    isOpen,
    description,
    shortDescription,
    backgroundId
  } = ctx.request.body;
  const { file, doc } = ctx.request.files;
  const docs = doc ? (Array.isArray(doc) ? doc : [doc]) : [];

  await uploadFiles(docs);

  const group = await models.ProjectGroup.create({
    title: title,
    isOpen: isOpen === "true",
    shortDescription,
    description,
    userId,
    backgroundId
  }).then(async group => {
    await models.File.bulkCreate(
      docs.map(doc => {
        return {
          userId,
          file: doc.name,
          groupId: group.id,
          size: doc.size
        };
      })
    );

    const role = await models.ParticipantRole.findOne();
    const participant = models.Participant.create({
      ProjectGroupId: group.id,
      UserId: userId,
      participantRoleId: role && role.id,
      state: 1,
      isAdmin: true
    });

    await notificationService.groupCreated({
      userId,
      title: group.title,
      groupId: group.id
    });

    return participant;
  });

  ctx.body = {
    id: group.id
  };
});

router.get("/backgrounds", async ctx => {
  const query = `select project_group_backgrounds.id, file from files, project_group_backgrounds 
                where files.id = project_group_backgrounds.file_id`;
  const result = await models.sequelize.query(query);

  ctx.body = result[0].map(r => {
    return {
      id: r.id,
      background: getUploadFilePath(r.file)
    };
  });
});

router.put("/backgrounds", async ctx => {
  const { groupId, backgroundId } = ctx.request.body;
  const userId = ctx.user.id;
  const query = `select file
              from project_groups 
              left join project_group_backgrounds on project_groups.background_id = project_group_backgrounds.id
              left join files on project_group_backgrounds.file_id = files.id 
              where project_groups.id = ${groupId}`;

  const group = await models.ProjectGroup.findOne({
    where: {
      id: groupId
    }
  });

  const canEdit = await canEditGroup(groupId, ctx);
  if (!canEdit) return;

  group.update({
    backgroundId
  });

  await snotificationServiceotificationService.groupAvatarChanged({
    userId,
    title: group.title,
    groupId
  });

  const file = await models.sequelize.query(query);
  ctx.body = file && getUploadFilePath(file[0][0].file);
});

router.delete("/:id", async ctx => {
  const { id } = ctx.params;
  const userId = ctx.user.id;

  const canEdit = await canEditGroup(id, ctx);
  if (!canEdit) return;

  await models.ProjectGroup.destroy({
    where: {
      id
    }
  });
  ctx.body = "ok";
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

router.get("/", async (ctx, next) => {
  const { page, pageSize } = ctx.request.query;
  const userId = ctx.user.id;
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  const query = `select title, avatar, id, is_open, user_id from
              project_groups limit ${limit} offset ${offset}`;

  const countQuery = `select project_groups.id, count(*) from project_groups, participants
                    where (project_groups.id = participants.project_group_id)
                    group by project_groups.id`;

  const groupsResult = await models.sequelize.query(query);

  const groupsCount = await models.ProjectGroup.count();

  const groups = groupsResult[0].map(async group => {
    const participantsQuery = `select count(*) from participants where project_group_id=${
      group.id
    }`;

    const conversationsQuery = `select count(*) from conversations where project_group_id=${
      group.id
    }`;

    const participant = await models.Participant.findOne({
      where: {
        [Op.and]: [{ UserId: userId }, { ProjectGroupId: group.id }]
      }
    });

    const participantsResult = await models.sequelize.query(participantsQuery);
    const conversationsResult = await models.sequelize.query(
      conversationsQuery
    );

    return {
      id: group.id,
      isOpen: group.is_open,
      title: group.title,
      avatar: getUploadFilePath(group.avatar) || "",
      isOpen: group.is_open,
      participantsCount: +participantsResult[0][0].count,
      conversationsCount: +conversationsResult[0][0].count,
      participant: participant !== null,
      state: (participant && participant.state) || 0,
      isAdmin: Boolean(participant && participant.isAdmin),
      files: [],
      participants: [],
      conversations: []
    };
  });

  const g = await Promise.all(groups);

  ctx.body = {
    groups: g,
    pagination: {
      total: groupsCount
    }
  };
});

router.get("/:id", async (ctx, next) => {
  const { id } = ctx.params;
  const userId = ctx.user.id;

  const query = `select title, file, project_groups.id, is_open, description, short_description, project_groups.user_id 
              from project_groups 
              left join project_group_backgrounds on project_groups.background_id = project_group_backgrounds.id
              left join files on project_group_backgrounds.file_id = files.id 
              where project_groups.id = ${id}`;

  const conversationsQuery = `select conversations.id, title, is_commentable, is_pinned, count(posts.id), min(posts.created_at) as     lastPostDate, users."name", conversations."description", conversations."created_at" from conversations
                              left join posts
                              on conversations.id = posts.conversation_id
                              left join users 
                              on conversations."user_id" = users.id
                              where conversations.project_group_id = ${id}
                              group by conversations.id, users."name"
                              `;
  const participantsQuery = `select participants."id", participants.is_admin, participants.state, users."name", users."id" as user_id, participant_roles."name" as role_name,
                          level, positions."name" as position, users."avatar"
                          from participants
                          left join users on (participants.user_id = users.id)
                          left join participant_roles on (participants.participant_role_id = participant_roles.id)
                          left join positions on (users.position_id = positions.id)
                          where (participants.project_group_id = ${id})
                          order by level`;

  const groupResult = await models.sequelize.query(query);
  const group = groupResult[0][0];
  const conversationResult = await models.sequelize.query(conversationsQuery);
  const conversations = conversationResult[0];
  const participantsResult = await models.sequelize.query(participantsQuery);
  const participants = participantsResult[0];

  const participant = await models.Participant.findOne({
    where: {
      [Op.and]: [{ UserId: userId }, { ProjectGroupId: id }]
    }
  });

  const files = await models.File.findAll({
    where: {
      groupId: id
    }
  });

  ctx.body = {
    id: group.id,
    isOpen: group.is_open,
    title: group.title || "",
    description: group.description || "",
    shortDescription: group.short_description || "",
    avatar: getUploadFilePath(group.file) || "",
    isOpen: Boolean(group.is_open),
    isAdmin: Boolean(participant && participant.isAdmin),
    state: (participant && participant.state) || 0,
    conversations: conversations.map(c => ({
      id: c.id,
      title: c.title || "",
      isCommentable: Boolean(c.is_commentable),
      isPinned: Boolean(c.is_pinned),
      count: +c.count,
      name: c.name,
      description: c.description || "",
      createdAt: c.created_at
    })),
    files: files.map(file => {
      return {
        id: file.id,
        name: file.file,
        url: getUploadFilePath(file.file)
      };
    }),
    participants: participants.map(participant => {
      return {
        id: participant.id,
        isAdmin: Boolean(participant.is_admin),
        state: participant.state || 0,
        userId: participant.userId,
        name: participant.name,
        position: participant.position || "",
        roleName: participant.role_name || "",
        level: participant.level || 0,
        avatar: getUploadFilePath(participant.avatar) || ""
      };
    }),
    participant: participant !== null
  };
});

// unsubscribe
router.delete("/:id/participants", async ctx => {
  const userId = ctx.user.id;
  const groupId = ctx.params.id;

  const participant = await models.Participant.findOne({
    where: {
      [Op.and]: [{ user_id: userId }, { project_group_id: groupId }]
    }
  });

  const admins = await models.Participant.findAll({
    where: {
      project_group_id: groupId,
      isAdmin: true
    }
  });

  if (participant.isAdmin && admins.length <= 1) {
    ctx.body = {
      success: false,
      message:
        "Перед тем, как покинуть группу, нужно назначить администратором другого участника группы"
    };
  } else {
    participant.destroy();
    ctx.body = { success: true };
  }
});

// subscribe
router.post("/:id/participants", async ctx => {
  const groupId = ctx.params.id;
  const userId = ctx.user.id;

  // notification setup
  const group = await models.ProjectGroup.findOne({ where: { id: groupId } });
  const adminsIds = await models.Participant.findAll({
    where: {
      [Op.and]: [
        {
          projectGroupId: group.id
        },
        {
          isAdmin: true
        }
      ]
    }
  }).map(a => a.userId);

  const user = await models.User.findOne({
    where: {
      id: userId
    }
  });

  await notificationService.groupRequestApplied({
    userId,
    title: group.title,
    groupId: group.id,
    applicantId: userId,
    applicantName: user.name,
    recipientsIds: adminsIds
  });

  //end

  const role = await models.ParticipantRole.findOne();

  let participant = await models.Participant.findOne({
    where: {
      ProjectGroupId: groupId,
      UserId: userId
    }
  });

  if (!participant) {
    participant = await models.Participant.create({
      ProjectGroupId: groupId,
      UserId: userId,
      participantRoleId: role && role.id,
      state: group.isOpen ? 1 : 2
    });
  } else {
    participant.update({
      participantRoleId: role && role.id,
      state: group.isOpen ? 1 : 2
    });
  }

  const notification = await models.NotificationPreference.create({
    type: "Группа",
    SourceId: groupId,
    UserId: userId,
    sms: false,
    push: false,
    email: false
  });

  ctx.body = participant;
});

// TODO где оно?
router.get("/:id/posts", async (ctx, next) => {
  const { id } = ctx.params;

  const query = `select posts.id, posts.parent_id, text, users.name, 
                users.avatar, users.position_id, positions.name as position, posts.created_at
                from posts, users, positions
                where (group_id=${id}) and (posts.user_id = users.id) and (users.position_id = positions.id)
                order by posts.created_at asc`;

  ctx.body = await getPosts({ query });
});

router.post("/:id/posts", koaBody({ multipart: true }), async ctx => {
  const { text, userId, postId } = ctx.request.body;
  const groupId = ctx.params.id;
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

router.post("/conversations", koaBody({ multipart: true }), async ctx => {
  const { title, projectGroupId, description, isNews } = ctx.request.body;
  const userId = ctx.user.id;
  const { file } = ctx.request.files;

  const canEdit = await canEditGroup(projectGroupId, ctx);
  if (!canEdit) return;

  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const conversation = await models.Conversation.create({
    title,
    ProjectGroupId: projectGroupId,
    description,
    userId,
    isCommentable: !(isNews === "true")
  });

  const createdFiles = await models.File.bulkCreate(
    files.map(file => {
      return {
        userId,
        file: file.name,
        conversationId: conversation.id,
        size: conversation.size
      };
    }),
    { returning: true }
  );

  // Notification setup
  const group = await models.ProjectGroup.findOne({
    where: {
      id: projectGroupId
    }
  });

  const participantsQuery = `select users.id from participants, users
                          where participants.project_group_id=${projectGroupId} and participants.user_id=users.id`;
  const participants = (await models.sequelize.query(participantsQuery))[0];

  notificationService.conversationCreated({
    userId,
    groupId: projectGroupId,
    groupTitle: group.title,
    conversationTitle: conversation.title,
    conversationId: conversation.id,
    recipientsIds: participants.map(p => p.id)
  });

  // end notification setup

  ctx.body = {
    id: conversation.id,
    name: ctx.user.userName,
    title: conversation.title,
    isPinned: false,
    description: conversation.description,
    userId: conversation.userId,
    count: 0,
    lastpostdate: null,
    files: createdFiles.map(f => ({
      id: f.id,
      size: f.size,
      name: f.file,
      url: getUploadFilePath(f.file)
    })),
    isCommentable: conversation.isCommentable,
    createdAt: conversation.createdAt
  };
});

router.put("/:id/title", async ctx => {
  const { title } = ctx.request.body;
  const groupId = ctx.params.id;

  const userId = ctx.user.id;
  const isAdmin = ctx.user.isAdmin;

  const canEdit = await canEditGroup(groupId, ctx);
  if (!canEdit) return;

  const group = await models.ProjectGroup.findOne({
    where: {
      id: groupId
    }
  });

  const oldTitle = group.title;

  await group.update({
    title
  });

  // notification
  await notificationService.groupNameChanged({
    userId,
    oldTitle,
    title,
    groupId
  });
  // end

  ctx.body = "ok";
});

router.put("/:id/shortDescription", async ctx => {
  const { shortDescription } = ctx.request.body;
  const groupId = ctx.params.id;
  const userId = ctx.user.id;

  const canEdit = await canEditGroup(groupId, ctx);
  if (!canEdit) return;

  const group = await models.ProjectGroup.findOne({
    where: {
      id: groupId
    }
  });

  group.update({
    shortDescription
  });

  await notificationService.groupDescriptionChanged({
    userId,
    title: group.title,
    groupId
  });

  ctx.body = "ok";
});

router.post("/conversations/pins", async ctx => {
  const { conversationId } = ctx.request.body;

  const conversation = await models.Conversation.findOne({
    where: {
      id: conversationId
    }
  });

  const canEdit = await canEditGroup(conversation.projectGroupId, ctx);
  if (!canEdit) return;

  await conversation.update({
    isPinned: true
  });

  ctx.body = "ok";
});

router.delete("/conversations/pins", async ctx => {
  const { conversationId } = ctx.request.query;

  const conversation = await models.Conversation.findOne({
    where: {
      id: conversationId
    }
  });

  const canEdit = await canEditGroup(conversation.projectGroupId, ctx);
  if (!canEdit) return;

  await conversation.update({
    isPinned: false
  });

  ctx.body = "ok";
});

// router.get("/participants", async ctx => {
//   const { groupId } = ctx.request.body;
//   const query = `select participants.id, users."name" as userName, positions."name" as position, participants.is_admin from participants
//                 left join users on participants.user_id = users.id
//                 left join positions on positions.id = users.position_id
//                 where project_group_id = ${groupId}
//                 `;

//   const participants = await models.sequelize.query(query);

//   ctx.body = participant[0].map(p => {
//     return {
//       id: p.id,
//       userName: p.userName,
//       position: p.position,
//       isAdmin: p.isAdmin
//     };
//   });
// });

router.post("/admins", async ctx => {
  const { id, userId } = ctx.request.body;
  const currentUserId = ctx.user.id;

  const participant = await models.Participant.findOne({ where: { id } });

  const canEdit = await canEditGroup(participant.projectGroupId, ctx);
  if (!canEdit) return;

  // notifications

  const user = await models.User.findOne({
    where: {
      id: participant.userId
    }
  });

  const group = await models.ProjectGroup.findOne({
    where: {
      id: participant.projectGroupId
    }
  });

  const participants = models.Participant.findAll();

  notificationService.groupAdminAssigned({
    userId: currentUserId,
    adminName: user.name,
    adminId: user.id,
    groupTitle: group.title,
    groupId: group.id,
    recipientsIds: participants.map(p => p.userId)
  });

  //

  const currentParticipant = await models.Participant.findOne({
    where: {
      [Op.and]: [
        { userId: currentUserId },
        { projectGroupId: participant.projectGroupId }
      ]
    }
  });

  await participant.update({
    isAdmin: true
  });

  ctx.body = { id: participant.id };
});

router.delete("/admins", async ctx => {
  const { id, userId } = ctx.request.query;
  const currentUserId = ctx.user.id;

  const participant = await models.Participant.findOne({ where: { id } });

  const canEdit = await canEditGroup(participant.projectGroupId, ctx);
  if (!canEdit) return;

  const currentParticipant = await models.Participant.findOne({
    where: {
      [Op.and]: [
        { userId: currentUserId },
        { projectGroupId: participant.projectGroupId }
      ]
    }
  });

  await participant.update({
    isAdmin: false
  });

  ctx.body = { id: participant.id };
});

router.post("/requests", async ctx => {
  const { id } = ctx.request.body;
  const userId = ctx.user.id;

  const participant = await models.Participant.findOne({ where: { id } });

  const canEdit = await canEditGroup(participant.projectGroupId, ctx);
  if (!canEdit) return;

  const currentParticipant = await models.Participant.findOne({
    where: {
      [Op.and]: [
        { userId: userId },
        { projectGroupId: participant.projectGroupId }
      ]
    }
  });

  await participant.update({
    state: 1
  });

  // Notification setup

  const group = await models.ProjectGroup.findOne({
    id: participant.projectGroupId
  });

  notificationService.groupRequestApproved({
    userId,
    recipientId: participant.userId,
    groupId: group.id,
    groupTitle: group.title
  });

  // end

  ctx.body = { id: participant.id };
});

router.post("/participants/remove", async ctx => {
  const { id, userId } = ctx.request.body;
  const currentUserId = ctx.user.id;

  const currentParticipant = await models.Participant.findOne({
    where: {
      [Op.and]: [{ userId: currentUserId }, { projectGroupId: id }]
    }
  });

  const canEdit = await canEditGroup(id, ctx);
  if (!canEdit) return;

  await models.Participant.destroy({
    where: { id: userId }
  });
  ctx.body = "ok";
});

router.get("/userGroups", async ctx => {
  const userId = ctx.user.id;
  const query = `select id, title from project_groups 
            where id in (select participants.project_group_id from participants
            where user_id = ${userId} and state = 1)`;
  const result = await models.sequelize.query(query);

  ctx.body = result[0];
});

module.exports = router;

async function canEditGroup(groupId, ctx) {
  const userId = ctx.user.id;

  const user = await models.User.findOne({
    where: {
      id: userId
    }
  });

  const participant = await models.Participant.findOne({
    where: {
      [Op.and]: [
        {
          projectGroupId: groupId
        },
        {
          userId
        }
      ]
    }
  });

  if (!(user.isAdmin || participant.isAdmin)) {
    ctx.status = 403;
    ctx.body = "Unauthorized!";
    return false;
  }

  return true;
}
