const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require("../../models");
const koaBody = require("koa-body");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");
const { createPost, getPosts } = require("./common/posts");

router.get("/", async (ctx, next) => {
  const userId = ctx.user.id;
  const query = `select conversations.id, conversations.project_group_id, title, is_commentable, users.name,
    conversations.created_at, conversations.user_id, count(posts.id), description
    from conversations
    left join posts
    on conversations.id = posts.conversation_id
    left join users 
    on conversations.user_id = users.id
    where project_group_id in (select participants.project_group_id from participants
    where user_id = :userId and state = 1) group by conversations.id, users.name
`;

  const [conversations] = await models.sequelize.query(query, {
    replacements: {
      userId
    }
  });

  ctx.body = conversations;
  ctx.body = conversations.map(c => ({
    id: c.id,
    title: c.title,
    userName: c.name,
    count: c.count,
    createdAt: c.created_at,
    description: c.description,
    isCommentable: c.is_commentable,
    groupId: c.project_group_id
  }));
});

module.exports = router;
