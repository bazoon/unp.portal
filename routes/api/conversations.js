const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const koaBody = require("koa-body");
const uploadFiles = require("../../utils/uploadFiles");
const { createPost, getPosts } = require("./common/posts");

const multer = require("koa-multer");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get("/get", async (ctx, next) => {
  const { id } = ctx.request.query;

  const conversation = await models.Conversation.findOne({ where: { id: id } });

  const query = `select "Posts"."id", "Posts"."ParentId", text, "Users"."name", 
                "Users"."avatar", "Users"."Position", "Posts"."createdAt"
                from "Posts", "Users"
                where ("ConversationId"=${id}) and ("Posts"."UserId" = "Users"."id")
                order by "Posts"."createdAt" asc`;

  const postsTree = await getPosts(query);

  ctx.body = {
    title: conversation.title,
    postsTree
  };
});

router.post("/post", koaBody({ multipart: true }), async ctx => {
  const { text, conversationId, userId, postId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];

  ctx.body = await createPost({
    text,
    conversationId,
    userId,
    postId,
    files
  });
});

module.exports = router;
