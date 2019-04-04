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

  const query = `select "Posts"."id", text, "Users"."name", 
                "Users"."avatar", "Users"."Position", "Posts"."createdAt"
                from "Posts", "Users"
                where ("ConversationId"=${id}) and ("Posts"."UserId" = "Users"."id")`;

  models.sequelize.query(query).then(function(posts) {
    const promises = posts[0].map(post => {
      return models.PostFile.findAll({ where: { PostId: post.id } }).then(
        postFiles => {
          return models.Comment.count({ where: { PostId: post.id } }).then(
            commentsCount => {
              return {
                id: post.id,
                text: post.text,
                avatar: post.avatar,
                userName: post.name,
                position: post.Position,
                createdAt: post.createdAt,
                files: postFiles.map(pf => ({
                  name: pf.file,
                  size: pf.size
                })),
                commentsCount
              };
            }
          );
        }
      );
    });

    Promise.all(promises).then(results => {
      res.json(results);
    });
  });
});

router.post("/post", upload.array("file", 12), function(req, res, next) {
  const { text, conversationId, userId } = req.body;
  const files = req.files;
  console.log(req.files);

  models.Post.create({
    text,
    ConversationId: conversationId,
    UserId: userId
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
