const express = require("express");
const router = express.Router();
const fs = require("fs");
const models = require("../../models");

const multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

router.get("/get", (req, res) => {
  const { id } = req.query;

  const query = `select "Posts"."id", "Posts"."ParentId", text, "Users"."name", 
                "Users"."avatar", "Users"."Position", "Posts"."createdAt"
                from "Posts", "Users"
                where ("ConversationId"=${id}) and ("Posts"."UserId" = "Users"."id")
                order by "Posts"."createdAt" asc`;

  models.sequelize.query(query).then(function(posts) {
    const promises = posts[0].map(post => {
      return models.PostFile.findAll({ where: { PostId: post.id } }).then(
        postFiles => {
          return {
            id: post.id,
            parentId: post.ParentId,
            text: post.text,
            avatar: post.avatar,
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

    Promise.all(promises).then(posts => {
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

      res.json(postsTree);
    });
  });
});

router.post("/post", upload.array("file", 12), function(req, res, next) {
  const { text, conversationId, userId, postId } = req.body;
  const files = req.files;

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
          avatar: user.avatar,
          userName: user.name,
          position: user.Position,
          createdAt: post.createdAt,
          files: files.map(f => ({ name: f.filename, size: f.size }))
        });
      });
    });
  });
});

module.exports = router;
