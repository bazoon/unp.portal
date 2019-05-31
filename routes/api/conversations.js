const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const koaBody = require("koa-body");
const uploadFiles = require("../../utils/uploadFiles");
const { createPost, getPosts } = require("./common/posts");

router.get("/get", async (ctx, next) => {
  const { id } = ctx.request.query;

  const conversation = await models.Conversation.findOne({ where: { id: id } });
  const user = await models.User.findOne({
    where: { id: conversation.userId }
  });
  const files = await models.File.findAll({
    where: {
      conversation_id: conversation.id
    }
  });

  const query = `select posts.id, posts.parent_id, text, users.name, 
                users.avatar, users.position_id, posts.created_at, positions.name as position
                from posts, users, positions
                where (conversation_id=${id}) and (posts.user_id = users.id) and (users.position_id = positions.id)
                order by posts.created_at asc`;

  const postsTree = await getPosts(query);

  ctx.body = {
    title: conversation.title,
    description: conversation.description,
    postsTree,
    name: user.name,
    files: files.map(file => ({
      id: file.id,
      name: file.file,
      url: getUploadFilePath(file.file)
    }))
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
