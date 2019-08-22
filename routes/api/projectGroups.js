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
const { fileOwners } = require("../../utils/constants");
const { getGroupUsersIds, getGroupAdminsIds } = require("./common/groups");
const {
  NotFoundRecordError,
  NotAuthorizedError
} = require("../../utils/errors");

router.delete("/conversations", async ctx => {
  const { id, groupId } = ctx.request.query;
  const userId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const conversation = await models.Conversation.findOne({
      where: {
        id
      },
      transaction
    });

    if (!conversation) {
      throw new NotFoundRecordError("Conversation not found");
    }

    const canEdit = await canEditGroup(groupId, ctx, transaction);

    if (!(canEdit || conversation.userId === userId)) {
      throw NotAuthorizedError();
    }

    await conversation.destroy();
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.status = e.status || 500;
    ctx.body = e.message;
  }
});

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

  let transaction;
  try {
    transaction = await models.sequelize.transaction();
    const group = await models.ProjectGroup.create(
      {
        title: title,
        isOpen: isOpen === "true",
        shortDescription,
        description,
        userId,
        backgroundId
      },
      { transaction }
    );

    await models.File.bulkCreate(
      docs.map(doc => {
        return {
          userId,
          file: doc.name,
          entityType: fileOwners.group,
          entityId: group.id,
          size: doc.size
        };
      }),
      { transaction }
    );

    // берем первую попавшуюся роль
    // TODO: лучше как-то иначе сделать
    const role = await models.ParticipantRole.findOne();
    if (!role) {
      throw new NotFoundRecordError("Role not found");
    }

    const participant = models.Participant.create(
      {
        ProjectGroupId: group.id,
        UserId: userId,
        participantRoleId: role && role.id,
        state: 1,
        isAdmin: true
      },
      { transaction }
    );

    await notificationService.groupCreated({
      userId,
      title: group.title,
      groupId: group.id,
      transaction
    });

    await transaction.commit();

    ctx.body = {
      id: group.id
    };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.get("/existingGroup", async ctx => {
  const { title } = ctx.request.query;

  const existingProjectGroup = await models.ProjectGroup.findOne({
    where: {
      title
    }
  });

  if (existingProjectGroup) {
    ctx.status = 409;
    ctx.body = "Группа с таким заголовком уже существует";
    return;
  }
  ctx.body = "";
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
              where project_groups.id = :groupId`;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const group = await models.ProjectGroup.findOne({
      where: {
        id: groupId
      },
      transaction
    });

    if (!group) {
      throw new NotFoundRecordError("Group not found!");
    }

    const canEdit = await checkEditGroup(groupId, ctx, transaction);
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    group.update(
      {
        backgroundId
      },
      { transaction }
    );

    await notificationService.groupAvatarChanged({
      userId,
      title: group.title,
      groupId,
      transaction
    });

    const file = await models.sequelize.query(query, {
      replacements: {
        groupId
      },
      transaction
    });
    await transaction.commit();
    ctx.body = file && getUploadFilePath(file[0][0].file);
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
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

router.delete("/requests", async ctx => {
  const { id } = ctx.request.query;
  const userId = ctx.user.id;
  let transaction;
  try {
    transaction = await models.sequelize.transaction();

    const participant = await models.Participant.findOne({
      where: { id },
      transaction
    });

    if (!participant) {
      throw new NotFoundRecordError("Participant not found");
    }

    const canEdit = await checkEditGroup(
      participant.projectGroupId,
      ctx,
      transaction
    );

    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    // Notification setup

    const group = await models.ProjectGroup.findOne({
      where: {
        id: participant.projectGroupId
      },
      transaction
    });

    if (!group) {
      throw new NotFoundRecordError("Group not found");
    }

    await notificationService.groupRequestDeclined({
      userId,
      recipientId: participant.userId,
      groupId: group.id,
      groupTitle: group.title,
      transaction
    });
    // end

    await models.Participant.destroy({
      where: {
        id: participant.id
      },
      transaction
    });
    await transaction.commit();
    ctx.body = { id: participant.id };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.delete("/participants", async ctx => {
  const { id } = ctx.request.query;
  const userId = ctx.user.id;

  let transaction;
  try {
    transaction = await models.sequelize.transaction();

    const participant = await models.Participant.findOne({
      where: {
        id
      },
      transaction
    });

    if (!participant) {
      throw new NotFoundRecordError("Participant not found");
    }

    const canEdit = await checkEditGroup(
      participant.projectGroupId,
      ctx,
      transaction
    );
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    // Notifications

    const user = await models.User.findOne({
      where: {
        id: participant.userId
      },
      transaction
    });

    const group = await models.ProjectGroup.findOne({
      where: {
        id: participant.projectGroupId
      },
      transaction
    });

    await notificationService.participantRemoved({
      userId,
      groupId: group.id,
      groupTitle: group.title,
      participantUserId: user.id,
      participantName: user.name,
      recipientsIds: await getGroupUsersIds(group.id, transaction),
      transaction
    });

    // end

    await models.Participant.destroy({
      where: { id },
      transaction
    });
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.delete("/admins", async ctx => {
  const { id, userId } = ctx.request.query;
  const currentUserId = ctx.user.id;
  let transaction;
  try {
    transaction = await models.sequelize.transaction();

    const participant = await models.Participant.findOne({
      where: { id },
      transaction
    });

    if (!participant) {
      throw new NotFoundRecordError("Participant not found");
    }

    const canEdit = await checkEditGroup(
      participant.projectGroupId,
      ctx,
      transaction
    );

    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    // Notifications setup
    const user = await models.User.findOne({
      where: {
        id: participant.userId
      },
      transaction
    });

    const group = await models.ProjectGroup.findOne({
      where: {
        id: participant.projectGroupId
      },
      transaction
    });

    notificationService.groupAdminRemoved({
      userId: currentUserId,
      adminName: user.name,
      adminId: user.id,
      groupTitle: group.title,
      groupId: group.id,
      recipientsIds: await getGroupUsersIds(group.id, transaction),
      transaction
    });

    //

    await participant.update(
      {
        isAdmin: false
      },
      { transaction }
    );

    await transaction.commit();
    ctx.body = { id: participant.id };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

// unsubscribe from group
router.delete("/:id/subscriptions", async ctx => {
  const userId = ctx.user.id;
  const groupId = ctx.params.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const participant = await models.Participant.findOne({
      where: {
        [Op.and]: [{ user_id: userId }, { project_group_id: groupId }]
      },
      transaction
    });

    if (!participant) {
      throw new NotFoundRecordError("Participant not found");
    }

    const admins = await models.Participant.findAll({
      where: {
        project_group_id: groupId,
        isAdmin: true
      },
      transaction
    });

    if (!admins || (admins && admins.length === 0)) {
      throw new NotFoundRecordError("Admin not found");
    }

    if (participant.isAdmin && admins.length <= 1) {
      ctx.body = {
        success: false,
        message:
          "Перед тем, как покинуть группу, нужно назначить администратором другого участника группы"
      };
    } else {
      // notifications
      const group = await models.ProjectGroup.findOne({
        where: {
          id: groupId
        },
        transaction
      });

      const user = await models.User.findOne({
        where: {
          id: userId
        },
        transaction
      });

      await notificationService.groupParticipantLeft({
        userId,
        title: group.title,
        groupId: group.id,
        applicantId: userId,
        applicantName: user.name,
        recipientsIds: await getGroupUsersIds(groupId, transaction),
        transaction
      });

      // end notifications

      // events update
      // 1) Переписать все события этого пользователя которые относятся
      // к этой группе на админа этой группы
      const groupAdmin = await models.Participant.findOne({
        where: {
          [Op.and]: {
            projectGroupId: groupId,
            isAdmin: true
          }
        },
        transaction
      });

      // Если пользователь вышел из групы
      if (groupAdmin) {
        const q = `select event_id from event_accesses where group_id=:groupId and user_id=:userId`;
        const query = `update events set user_id = :adminId where user_id=:userId
                      and id in (select event_id from event_accesses where group_id=:groupId)
                      `;
        await models.sequelize.query(query, {
          replacements: {
            adminId: groupAdmin.userId,
            userId,
            groupId
          },
          transaction
        });
      }
      await models.Participant.destroy({
        where: {
          id: participant.id
        },
        transaction
      });

      await transaction.commit();
      ctx.body = { success: true };
    }
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.delete("/files", async ctx => {
  const { fileId } = ctx.request.query;
  await models.File.destroy({
    where: {
      id: fileId
    }
  });
  ctx.body = fileId;
});

router.delete("/:id", async ctx => {
  const { id } = ctx.params;
  const userId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const canEdit = await checkEditGroup(id, ctx, transaction);
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    // notifications
    const group = await models.ProjectGroup.findOne({
      where: { id }
    });

    if (!group) {
      throw new NotFoundRecordError("Group not found");
    }

    await notificationService.groupRemoved({
      userId,
      title: group.title,
      groupId: group.id,
      transaction
    });

    //
    await models.ProjectGroup.destroy({
      where: {
        id
      },
      transaction
    });
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
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
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const query =
      page || pageSize
        ? `select title, avatar, id, is_open, user_id from
                project_groups limit :limit offset :offset`
        : "select title, avatar, id, is_open, user_id from project_groups";

    const countQuery = `select project_groups.id, count(*) from project_groups, participants
                      where (project_groups.id = participants.project_group_id)
                      group by project_groups.id`;

    const groupsResult = await models.sequelize.query(query, {
      replacements: {
        limit,
        offset
      },
      transaction
    });

    const groupsCount = await models.ProjectGroup.count({ transaction });

    const groupsPromises = groupsResult[0].map(async group => {
      const participantsQuery = `select count(*) from participants where project_group_id=:groupId`;

      const conversationsQuery = `select count(*) from conversations where project_group_id=:groupId`;

      const participant = await models.Participant.findOne({
        where: {
          [Op.and]: [{ UserId: userId }, { ProjectGroupId: group.id }]
        },
        transaction
      });

      const participantsResult = await models.sequelize.query(
        participantsQuery,
        {
          replacements: {
            groupId: group.id
          },
          transaction
        }
      );
      const conversationsResult = await models.sequelize.query(
        conversationsQuery,
        {
          replacements: {
            groupId: group.id
          },
          transaction
        }
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

    const groups = await Promise.all(groupsPromises);
    await transaction.commit();

    ctx.body = {
      groups: groups,
      pagination: {
        total: groupsCount
      }
    };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.get("/userGroups", async ctx => {
  const userId = ctx.user.id;
  const query = `select id, title from project_groups 
            where id in (select participants.project_group_id from participants
            where user_id = :userId and state = 1)`;
  const result = await models.sequelize.query(query, {
    replacements: {
      userId
    }
  });

  ctx.body = result[0];
});

router.get("/search/:query", async (ctx, next) => {
  const { query } = ctx.params;
  let searchResults = [];

  if (query) {
    searchResults = await models.sequelize.query(
      ` select *
        from project_groups
        where _search @@ to_tsquery(:query)`,
      {
        model: models.ProjectGroup,
        replacements: { query: `${query} | ${query}:*` }
      }
    );
  }
  ctx.body = searchResults;
});

router.get("/:id", async (ctx, next) => {
  const { id } = ctx.params;
  const { id: userId, isAdmin: isSuperAdmin } = ctx.user;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const query = `select title, file, project_groups.id, is_open, description, short_description, project_groups.user_id 
                from project_groups 
                left join project_group_backgrounds on project_groups.background_id = project_group_backgrounds.id
                left join files on project_group_backgrounds.file_id = files.id 
                where project_groups.id = :id`;

    const conversationsQuery = `select conversations.user_id, conversations.id, title, is_commentable, is_pinned, count(posts.id), min(posts.created_at) as     lastPostDate, users."name", conversations."description", conversations."created_at" from conversations
                                left join posts
                                on conversations.id = posts.conversation_id
                                left join users 
                                on conversations."user_id" = users.id
                                where conversations.project_group_id = :id
                                group by conversations.id, users."name"
                                order by conversations.created_at desc
                                `;
    const participantsQuery = `select participants."id", participants.is_admin, participants.state, users."name", users."id" as user_id, participant_roles."name" as role_name,
                            level, positions."name" as position, users."avatar"
                            from participants
                            left join users on (participants.user_id = users.id)
                            left join participant_roles on (participants.participant_role_id = participant_roles.id)
                            left join positions on (users.position_id = positions.id)
                            where (participants.project_group_id = :id)
                            order by is_admin, state desc, level`;

    const groupResult = await models.sequelize.query(query, {
      replacements: {
        id
      },
      transaction
    });

    const group = groupResult[0][0];
    const conversationResult = await models.sequelize.query(
      conversationsQuery,
      {
        replacements: {
          id
        },
        transaction
      }
    );
    const conversations = conversationResult[0];
    const participantsResult = await models.sequelize.query(participantsQuery, {
      replacements: {
        id
      },
      transaction
    });
    const participants = participantsResult[0];

    const participant = await models.Participant.findOne({
      where: {
        [Op.and]: [{ UserId: userId }, { ProjectGroupId: id }]
      },
      transaction
    });

    const state = participant && participant.state;

    const isGroupAdmin =
      Boolean(participant && participant.isAdmin) || isSuperAdmin;

    const files = await models.File.findAll({
      where: {
        entityType: fileOwners.group,
        entityId: id
      },
      transaction
    });

    await transaction.commit();

    ctx.body = {
      id: group.id,
      isOpen: group.is_open,
      title: group.title || "",
      description: group.description || "",
      shortDescription: group.short_description || "",
      avatar: getUploadFilePath(group.file) || "",
      isOpen: Boolean(group.is_open),
      isAdmin: isGroupAdmin,
      canPost: state === 1,
      canView: isGroupAdmin || state === 1,
      state: (participant && participant.state) || 0,
      conversations: conversations.map(c => ({
        id: c.id,
        title: c.title || "",
        isCommentable: Boolean(c.is_commentable),
        isPinned: Boolean(c.is_pinned),
        count: +c.count,
        name: c.name,
        description: c.description || "",
        createdAt: c.created_at,
        canDelete: c.user_id === userId || isGroupAdmin
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
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

// subscribe
router.post("/:id/subscriptions", async ctx => {
  const groupId = ctx.params.id;
  const userId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    // notification setup
    const group = await models.ProjectGroup.findOne({
      where: { id: groupId },
      transaction
    });
    const user = await models.User.findOne({
      where: {
        id: userId
      },
      transaction
    });

    if (group.isOpen) {
      await notificationService.groupParticipantJoined({
        userId,
        title: group.title,
        groupId: group.id,
        applicantId: userId,
        applicantName: user.name,
        recipientsIds: await getGroupUsersIds(groupId, transaction),
        transaction
      });
    } else {
      await notificationService.groupRequestApplied({
        userId,
        title: group.title,
        groupId: group.id,
        applicantId: userId,
        applicantName: user.name,
        recipientsIds: await getGroupAdminsIds(groupId),
        transaction
      });
    }

    //end
    const role = await models.ParticipantRole.findOne({ transaction });

    let participant = await models.Participant.findOne({
      where: {
        ProjectGroupId: groupId,
        UserId: userId
      },
      transaction
    });

    if (!participant) {
      participant = await models.Participant.create(
        {
          ProjectGroupId: groupId,
          UserId: userId,
          participantRoleId: role && role.id,
          state: group.isOpen ? 1 : 2
        },
        { transaction }
      );
    } else {
      participant.update(
        {
          participantRoleId: role && role.id,
          state: group.isOpen ? 1 : 2
        },
        { transaction }
      );
    }

    const notification = await models.NotificationPreference.create(
      {
        type: "Группа",
        SourceId: groupId,
        UserId: userId,
        sms: false,
        push: false,
        email: false
      },
      transaction
    );
    await transaction.commit();
    ctx.body = participant;
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

// TODO где оно?
// router.get("/:id/posts", async (ctx, next) => {
//   const { id } = ctx.params;

//   const query = `select posts.id, posts.parent_id, text, users.name,
//                 users.avatar, users.position_id, positions.name as position, posts.created_at
//                 from posts, users, positions
//                 where (group_id=${id}) and (posts.user_id = users.id) and (users.position_id = positions.id)
//                 order by posts.created_at asc`;

//   ctx.body = await getPosts({ query });
// });

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
  const { id: userId } = ctx.user;
  const { file } = ctx.request.files;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const canEdit = await canPostToGroup(projectGroupId, ctx, transaction);
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    const files = file ? (Array.isArray(file) ? file : [file]) : [];
    await uploadFiles(files);

    const conversation = await models.Conversation.create(
      {
        title,
        ProjectGroupId: projectGroupId,
        description,
        userId,
        isCommentable: !(isNews === "true")
      },
      { transaction }
    );

    const createdFiles = await models.File.bulkCreate(
      files.map(file => {
        return {
          userId,
          file: file.name,
          entityType: fileOwners.conversation,
          entityId: conversation.id,
          size: conversation.size
        };
      }),
      { returning: true, transaction }
    );

    // Notification setup
    const group = await models.ProjectGroup.findOne({
      where: {
        id: projectGroupId
      },
      transaction
    });

    notificationService.conversationCreated({
      userId,
      groupId: projectGroupId,
      groupTitle: group.title,
      conversationTitle: conversation.title,
      conversationId: conversation.id,
      recipientsIds: await getGroupUsersIds(projectGroupId, transaction),
      transaction
    });

    // end notification setup

    await transaction.commit();

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
      createdAt: conversation.createdAt,
      canDelete: true
    };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.put("/:id/title", async ctx => {
  const { title } = ctx.request.body;
  const groupId = ctx.params.id;

  const userId = ctx.user.id;
  const isAdmin = ctx.user.isAdmin;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const canEdit = await checkEditGroup(groupId, ctx, transaction);
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    const group = await models.ProjectGroup.findOne({
      where: {
        id: groupId
      },
      transaction
    });

    const oldTitle = group.title;

    await group.update(
      {
        title
      },
      { transaction }
    );

    // notification
    await notificationService.groupNameChanged({
      userId,
      oldTitle,
      title,
      groupId,
      transaction
    });
    // end
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.put("/:id/shortDescription", async ctx => {
  const { shortDescription } = ctx.request.body;
  const groupId = ctx.params.id;
  const userId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const canEdit = await checkEditGroup(groupId, ctx, transaction);
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    const group = await models.ProjectGroup.findOne({
      where: {
        id: groupId
      },
      transaction
    });

    group.update(
      {
        shortDescription
      },
      { transaction }
    );

    await notificationService.groupDescriptionChanged({
      userId,
      title: group.title,
      groupId,
      transaction
    });

    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.post("/conversations/pins", async ctx => {
  const { conversationId } = ctx.request.body;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const conversation = await models.Conversation.findOne({
      where: {
        id: conversationId
      },
      transaction
    });

    const canEdit = await checkEditGroup(
      conversation.projectGroupId,
      ctx,
      transaction
    );

    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    await conversation.update(
      {
        isPinned: true
      },
      { transaction }
    );
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.delete("/conversations/pins", async ctx => {
  const { conversationId } = ctx.request.query;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const conversation = await models.Conversation.findOne({
      where: {
        id: conversationId
      },
      transaction
    });

    const canEdit = await checkEditGroup(
      conversation.projectGroupId,
      ctx,
      transaction
    );
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    await conversation.update(
      {
        isPinned: false
      },
      { transaction }
    );
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.post("/admins", async ctx => {
  const { id, userId } = ctx.request.body;
  const currentUserId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const participant = await models.Participant.findOne({
      where: { id },
      transaction
    });

    const canEdit = await checkEditGroup(
      participant.projectGroupId,
      ctx,
      transaction
    );
    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    // notifications

    const user = await models.User.findOne({
      where: {
        id: participant.userId
      },
      transaction
    });

    if (!user) {
      throw new NotFoundRecordError("User not found");
    }

    const group = await models.ProjectGroup.findOne({
      where: {
        id: participant.projectGroupId
      },
      transaction
    });

    if (!group) {
      throw new NotFoundRecordError("Group not found");
    }

    notificationService.groupAdminAssigned({
      userId: currentUserId,
      adminName: user.name,
      adminId: user.id,
      groupTitle: group.title,
      groupId: group.id,
      recipientsIds: await getGroupUsersIds(group.id, transaction),
      transaction
    });

    //

    const currentParticipant = await models.Participant.findOne({
      where: {
        [Op.and]: [
          { userId: currentUserId },
          { projectGroupId: participant.projectGroupId }
        ]
      },
      transaction
    });

    await participant.update(
      {
        isAdmin: true
      },
      { transaction }
    );

    await transaction.commit();
    ctx.body = { id: participant.id };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

// Approve request
router.post("/requests", async ctx => {
  const { id } = ctx.request.body;
  const userId = ctx.user.id;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();
    const participant = await models.Participant.findOne({
      where: { id },
      transaction
    });
    if (!participant) {
      throw new NotFoundRecordError("Participant not found");
    }

    const canEdit = await checkEditGroup(
      participant.projectGroupId,
      ctx,
      transaction
    );

    if (!canEdit) {
      throw new NotAuthorizedError();
    }

    const currentParticipant = await models.Participant.findOne({
      where: {
        [Op.and]: [
          { userId: userId },
          { projectGroupId: participant.projectGroupId }
        ]
      },
      transaction
    });

    await participant.update(
      {
        state: 1
      },
      { transaction }
    );

    // Notification setup
    const group = await models.ProjectGroup.findOne({
      where: {
        id: participant.projectGroupId
      },
      transaction
    });

    notificationService.groupRequestApproved({
      userId,
      recipientId: participant.userId,
      groupId: group.id,
      groupTitle: group.title,
      transaction
    });
    // end

    await transaction.commit();
    ctx.body = { id: participant.id };
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.post("/files", koaBody({ multipart: true }), async ctx => {
  const userId = ctx.user.id;
  const { groupId } = ctx.request.body;
  const { file } = ctx.request.files;
  const docs = file ? (Array.isArray(file) ? file : [file]) : [];
  try {
    await uploadFiles(docs);
    const files = await models.File.bulkCreate(
      docs.map(doc => {
        return {
          userId,
          file: doc.name,
          entityType: fileOwners.group,
          entityId: groupId,
          size: doc.size
        };
      }),
      { returning: true }
    );
    ctx.body = files.map(f => ({
      id: f.id,
      name: f.file,
      url: getUploadFilePath(f.file),
      size: f.size
    }));
  } catch (e) {
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

module.exports = router;

async function canEditGroup(groupId, ctx, transaction) {
  const { id: userId, isAdmin } = ctx.user;

  const user = await models.User.findOne({
    where: {
      id: userId
    },
    transaction
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
    },
    transaction
  });

  if (!(isAdmin || (participant && participant.isAdmin))) {
    return false;
  }

  return true;
}

async function checkEditGroup(groupId, ctx, transaction) {
  if (!(await canEditGroup(groupId, ctx, transaction))) {
    ctx.status = 403;
    ctx.body = "Unauthorized!";
    return false;
  }

  return true;
}

async function canPostToGroup(groupId, ctx, transaction) {
  const userId = ctx.user.id;

  const user = await models.User.findOne({
    where: {
      id: userId
    },
    transaction
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
    },
    transaction
  });

  if (!(user.isAdmin || participant.isAdmin || participant.state === 1)) {
    return false;
  }

  return true;
}
