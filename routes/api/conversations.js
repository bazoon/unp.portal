const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const koaBody = require("koa-body");
const uploadFiles = require("../../utils/uploadFiles");

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

  const postsTree = await models.sequelize.query(query).then(function(posts) {
    const promises = posts[0].map(post => {
      return models.PostFile.findAll({ where: { PostId: post.id } }).then(
        postFiles => {
          return {
            id: post.id,
            parentId: post.ParentId,
            text: post.text,
            avatar: getUploadFilePath(post.avatar),
            userName: post.name,
            position: post.Position,
            createdAt: post.createdAt,
            files: postFiles.map(pf => ({
              name: pf.file,
              size: pf.size
            }))
          };
        }
      );
    });

    const postsLookup = {};

    return Promise.all(promises).then(posts => {
      posts.forEach(post => {
        postsLookup[post.id] = post;
      });

      const postsTree = posts.reduce((acc, post) => {
        post.children = post.children || [];
        if (post.parentId) {
          const parentPost = postsLookup[post.parentId];
          parentPost.children = parentPost.children || [];
          parentPost.children.push(post);
          return acc;
        }
        return acc.concat([post]);
      }, []);

      return postsTree;
    });
  });

  ctx.body = {
    title: conversation.title,
    postsTree
  };
});

router.post("/post", koaBody({ multipart: true }), async ctx => {
  const { text, conversationId, userId, postId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const posts = await models.Post.create({
    text,
    ConversationId: conversationId,
    UserId: userId,
    ParentId: postId
  }).then(post => {
    return models.PostFile.bulkCreate(
      files.map(f => ({ PostId: post.id, file: f.name, size: f.size }))
    ).then(() => {
      const query = `select "Users"."name", "Users"."avatar", "Users"."Position"
                from "Users"
                where "Users"."id"=${userId}`;

      return models.sequelize.query(query).then(function(users) {
        const user = users[0][0];
        return {
          id: post.id,
          parentId: post.ParentId,
          text: post.text,
          avatar: getUploadFilePath(user.avatar),
          userName: user.name,
          position: user.Position,
          createdAt: post.createdAt,
          files: files.map(f => ({ name: f.name, size: f.size })),
          children: []
        };
      });
    });
  });

  ctx.body = posts;
});

module.exports = router;
