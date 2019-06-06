const Router = require("koa-router");
const router = new Router();
const koaBody = require("koa-body");
const fs = require("fs");
const models = require("../../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");

router.get("/", async ctx => {
  const files = await models.File.findAll();
  ctx.body = files.map(file => {
    return {
      id: file.id,
      name: file.file,
      size: file.size,
      url: getUploadFilePath(file.file),
      createdAt: file.createdAt
    };
  });
});

router.post("/", koaBody({ multipart: true }), async ctx => {
  const { file } = ctx.request.files;
  const files = Array.isArray(file) ? file : [file];

  await uploadFiles(files);

  await models.File.bulkCreate(
    files.map(f => {
      return {
        file: f.name,
        size: f.size,
        url: getUploadFilePath(f.name),
        createdAt: f.createdAt
      };
    })
  );

  ctx.body = "ok";
});

module.exports = router;
