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

router.get("/recipients", async (ctx, next) => {
  const { userId } = ctx.request.query;
  const query = `select "ProjectGroups"."title",  "ProjectGroups"."id", "ProjectGroups"."avatar", 
				       "Conversations"."title" as ctitle, "Conversations"."id" as cid
                from "ProjectGroups", "Participants", "Conversations"
                where "ProjectGroups"."id" = "Participants"."ProjectGroupId" and
                "Participants"."UserId" = ${userId} and
                "Conversations"."ProjectGroupId" = "ProjectGroups"."id"`;

  const groups = await models.sequelize.query(query);
  ctx.body = groups[0];
});

router.get("/group_posts", async (ctx, next) => {
  const { userId } = ctx.request.query;
  const query = `select "ProjectGroups"."title","Posts"."id", 
              "Posts"."text", "Posts"."createdAt", "Posts"."ParentId",
              "Users"."avatar", "Users"."name" as "userName", "Users"."PositionId" as "position",
              "Conversations"."id" as "cid", "Conversations"."title" as "conversationTitle"
              from "ProjectGroups", "Participants", "Conversations", "Posts", "Users"
              where "ProjectGroups"."id" = "Participants"."ProjectGroupId" and
              "Participants"."UserId" = ${userId} and
              "Conversations"."ProjectGroupId" = "ProjectGroups"."id" and
              "Posts"."ConversationId" = "Conversations"."id" and
              "Posts"."UserId"="Users"."id" 
              order by "Posts"."createdAt" desc`;

  ctx.body = await getPosts({ query });
  return;

  const postsTree = await models.sequelize.query(query).then(function(posts) {
    const promises = posts[0].map(post => {
      return models.PostFile.findAll({ where: { PostId: post.id } }).then(
        postFiles => {
          return {
            id: post.id,
            parentId: post.ParentId,
            text: post.text,
            avatar: getUploadFilePath(post.avatar),
            userName: post.userName,
            position: post.position,
            createdAt: post.createdAt,
            cid: post.cid,
            title: post.title,
            conversationTitle: post.conversationTitle,
            files: postFiles.map(pf => ({
              name: pf.file,
              size: pf.size
            }))
          };
        }
      );
    });

    const postsLookup = {};
    posts[0].forEach(post => {
      postsLookup[post.id] = post;
    });

    return Promise.all(promises).then(posts => {
      posts.forEach(post => {
        postsLookup[post.id] = post;
      });

      const postsTree = posts.reduce((acc, post) => {
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

  ctx.body = postsTree;
});

router.post("/postToFeed", koaBody({ multipart: true }), async ctx => {
  const { to, message, userId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);
  const { groups } = JSON.parse(to);

  // ctx.body = {};
  // return;

  const postsPromises = groups.map(([groupId, conversationId]) => {
    return createPost({ text: message, userId, conversationId, files });

    // return models.Post.create({
    //   text: message,
    //   ConversationId: conversationId,
    //   UserId: userId,
    //   ParentId: null
    // }).then(post => {
    //   return models.PostFile.bulkCreate(
    //     files.map(f => ({
    //       PostId: post.id,
    //       file: f.filename,
    //       size: f.size
    //     }))
    //   );
    // });
  });

  ctx.body = await Promise.all(postsPromises);
});

router.post("/postReplyToFeed", koaBody({ multipart: true }), async ctx => {
  const { text, userId, postId, conversationId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];

  ctx.body = createPost({ text, userId, postId, conversationId, files });
  return;
  models.Post.create({
    text,
    ConversationId: conversationId,
    UserId: userId,
    ParentId: postId
  }).then(post => {
    models.PostFile.bulkCreate(
      files.map(f => ({ PostId: post.id, file: f.filename, size: f.size }))
    ).then(() => {
      const query = `select "Users"."name", "Users"."avatar", "Users"."Position"
                from "Users"
                where "Users"."id"=${userId}`;

      models.sequelize.query(query).then(function(users) {
        const user = users[0][0];
        res.json({
          id: post.id,
          parentId: post.ParentId,
          text: post.text,
          avatar: getUploadFilePath(user.avatar),
          userName: user.name,
          position: user.Position,
          createdAt: post.createdAt,
          files: files.map(f => ({ name: f.filename, size: f.size }))
        });
      });
    });
  });
});

router.post("/comment", (req, res) => {
  fs.readFile(fileName, "utf8", function(err, contents) {
    if (!err) {
      const feed = JSON.parse(contents);
      const id = req.body.id;
      const text = req.body.text;
      const item = feed.find(i => i.id == id);

      const last =
        item.comments.length > 0
          ? item.comments[item.comments.length - 1]
          : undefined;

      item.comments.push({
        id: last ? last.id + 1 : 0,
        author: "Соколова Виктория",
        avatar: "https://fakeimg.pl/40x40/",
        text
      });

      fs.writeFile(fileName, JSON.stringify(feed), function(err) {
        if (!err) {
          res.json({ m: "ok" });
        }
      });
    }
  });
});

module.exports = router;
