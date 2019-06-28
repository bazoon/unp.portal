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

router.get("/", async ctx => {
  // const files = await models.File.findAll();
  const query = `select files.id, file, size,entity_type, project_groups.title as t1, conversations.title as t2, posts.text as t3, events.title as t4, messages.message as t5, entity_id, name from files
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
      author: file.name
    };
  });

  // ctx.body = files.map(file => {
  //   return {
  //     id: file.id,
  //     name: file.file,
  //     size: file.size,
  //     url: getUploadFilePath(file.file),
  //     createdAt: file.createdAt
  //   };
  // });
});

router.post("/", koaBody({ multipart: true }), async ctx => {
  const { file } = ctx.request.files;
  const userId = ctx.user.id;
  const files = Array.isArray(file) ? file : [file];

  await uploadFiles(files);

  // notifications
  await notificationService.documentsAdded({
    userId,
    files: files.map(f => {
      return {
        name: f.name,
        url: getUploadFilePath(f.name)
      };
    })
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
    })
  );

  ctx.body = "ok";
});

router.delete("/:id", async ctx => {
  const { id } = ctx.params;
  const userId = ctx.user.id;

  // notifications
  const file = await models.File.findOne({
    where: {
      id
    }
  });

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
  ctx.body = "ok";
});

module.exports = router;
