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
  const query = `select project_groups.title,  project_groups.id, project_groups.avatar, 
				        conversations.title as ctitle, conversations.id as cid
                from project_groups, participants, conversations
                where project_groups.id = participants.project_group_id and
                participants.user_id = ${userId} and
                conversations.project_group_id = project_groups.id`;

  const groups = await models.sequelize.query(query);
  ctx.body = groups[0];
});

router.get("/group_posts", async (ctx, next) => {
  const { userId } = ctx.request.query;
  const query = `select project_groups.title, posts.id, 
              posts.text, posts.created_at, posts.parent_id,
              users.avatar, users.name as userName, users.position_id as position,
              conversations.id as cid, conversations.title as conversationTitle
              from project_groups, participants, conversations, posts, users
              where project_groups.id = participants.project_group_id and
              participants.user_id = ${userId} and
              conversations.project_group_id = project_groups.id and
              posts.conversation_id = conversations.id and
              posts.user_id=users.id 
              order by posts.created_at desc`;

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

  if (postId) {
    parentPost = await models.Post.findOne({ where: { id: postId } });
  }

  const post = await models.Post.create({
    text,
    conversationId: parentPost.conversationId,
    userId: userId,
    parentId: postId
  });

  const readyFiles = await models.File.bulkCreate(
    files.map(f => ({ postId: post.id, file: f.name, size: f.size }))
  );

  const query = `select users.name, users.avatar, positions.name as position
                from users, positions
                where users.id=${userId} and users.position_id=positions.id`;

  const readyPost = await models.sequelize.query(query).then(function(users) {
    const user = users[0][0];
    return {
      id: post.id,
      parentId: post.ParentId,
      text: post.text,
      avatar: getUploadFilePath(user.avatar),
      userName: user.name,
      position: user.Position,
      createdAt: post.createdAt,
      files: readyFiles.map(f => ({ name: f.filename, size: f.size }))
    };
  });

  ctx.body = readyPost;
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
