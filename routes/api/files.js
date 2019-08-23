const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");
const notificationService = require("../../utils/notifications");
const { fileOwners } = require("../../utils/constants");
const {
  NotFoundRecordError,
  NotAuthorizedError
} = require("../../utils/errors");

router.get("/", async ctx => {
  const { id: userId, isAdmin } = ctx.user;
  const query = `select files.id, files.user_id, file, size, entity_type, project_groups.title as t1, conversations.title as t2, posts.text as t3, events.title as t4, messages.message as t5, entity_id, name from files
                left join project_groups on project_groups.id = entity_id and entity_type = 0
                left join conversations on conversations.id = entity_id and entity_type = 1
                left join posts on posts.id = entity_id and entity_type = 2
                left join events on events.id = entity_id and entity_type = 3
                left join messages on messages.id = entity_id and entity_type = 4
                left join users on files.user_id = users.id
              `;

  const owners = ["Группа", "Обсуждение", "Пост", "Событие", "Сообщение"];

  const files = await models.sequelize.query(query);

  ctx.body = files[0].map(file => {
    const title = file.t1 || file.t2 || file.t3 || file.t4 || file.t5;

    return {
      id: file.id,
      name: file.file,
      size: file.size,
      url: getUploadFilePath(file.file),
      createdAt: file.created_at,
      description:
        (title && `${owners[file.entity_type]} "${title}"`) ||
        "Файл не имеет описания",
      author: file.name,
      canDelete: isAdmin || file.user_id === userId
    };
  });
});

router.post("/", koaBody({ multipart: true }), async ctx => {
  const { file } = ctx.request.files;
  const userId = ctx.user.id;
  const files = Array.isArray(file) ? file : [file];
  let transaction;
  await uploadFiles(files);

  try {
    transaction = await models.sequelize.transaction();
    // notifications
    await notificationService.documentsAdded({
      userId,
      files: files.map(f => {
        return {
          name: f.name,
          url: getUploadFilePath(f.name)
        };
      }),
      transaction
    });

    await models.File.bulkCreate(
      files.map(f => {
        return {
          userId,
          file: f.name,
          size: f.size,
          createdAt: f.createdAt,
          url: getUploadFilePath(f.name)
        };
      }),
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

router.get("/search/:query", async (ctx, next) => {
  const { query } = ctx.params;
  const { id: userId, isAdmin } = ctx.user;
  let searchResults = [];

  const sqlQuery = `select files.id, files.user_id, file, size,entity_type, project_groups.title as t1, conversations.title as t2, posts.text as t3, events.title as t4, messages.message as t5, entity_id, name from files
                left join project_groups on project_groups.id = entity_id and entity_type = 0
                left join conversations on conversations.id = entity_id and entity_type = 1
                left join posts on posts.id = entity_id and entity_type = 2
                left join events on events.id = entity_id and entity_type = 3
                left join messages on messages.id = entity_id and entity_type = 4
                left join users on files.user_id = users.id
                where files._search @@ to_tsquery(:query)
                `;

  const owners = ["Группа", "Обсуждение", "Пост", "Событие", "Сообщение"];

  const files = await models.sequelize.query(sqlQuery, {
    replacements: { query: `${query} | ${query}:*` }
  });

  ctx.body = files[0].map(file => {
    const title = file.t1 || file.t2 || file.t3 || file.t4 || file.t5;
    return {
      id: file.id,
      name: file.file,
      size: file.size,
      url: getUploadFilePath(file.file),
      createdAt: file.created_at,
      description:
        (title && `${owners[file.entity_type]} "${title}"`) ||
        "Файл не имеет описания",
      author: file.name,
      canDelete: isAdmin || file.user_id === userId
    };
  });
});

router.delete("/:id", async ctx => {
  const { id } = ctx.params;
  const { id: userId, isAdmin } = ctx.user;
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    const file = await models.File.findOne({
      where: {
        id
      }
    });

    if (!(isAdmin || file.userId === userId)) {
      ctx.status = 403;
      ctx.body = "Unauthorized!";
      return false;
    }

    // notifications

    notificationService.documentRemoved({
      userId,
      file: file.file
    });

    // end

    models.File.destroy({
      where: {
        id
      }
    });
    await transaction.commit();
    ctx.body = "ok";
  } catch (e) {
    await transaction.rollback();
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

module.exports = router;
