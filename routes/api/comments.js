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
  const query = `select "Comments"."id", comment, "Users"."name", 
                "Users"."avatar", "Users"."Position", "Comments"."createdAt"
                from "Comments", "Users"
                where ("PostId"=${id}) and ("Comments"."UserId" = "Users"."id")`;

  models.sequelize.query(query).then(function(comments) {
    const promises = comments[0].map(comment => {
      return models.CommentFile.findAll({
        where: { CommentId: comment.id }
      }).then(commentFiles => {
        return {
          id: comment.id,
          comment: comment.comment,
          avatar: comment.avatar,
          userName: comment.name,
          position: comment.Position,
          createdAt: comment.createdAt,
          files: commentFiles.map(pf => ({ name: pf.file, size: pf.size }))
        };
      });
    });

    Promise.all(promises).then(results => {
      res.json(results);
    });
  });
});

router.post("/post", upload.array("file", 12), function(req, res, next) {
  const { comment, postId, userId } = req.body;
  const files = req.files || [];
  console.log(files);

  models.Comment.create({
    comment,
    PostId: postId,
    UserId: userId
  }).then(comment => {
    models.CommentFile.bulkCreate(
      files.map(f => ({
        CommentId: comment.id,
        file: f.filename,
        size: f.size
      }))
    ).then(() => {
      const query = `select "Users"."name", "Users"."avatar", "Users"."Position"
                  from "Users"
                  where "Users"."id"=${userId}`;

      models.sequelize.query(query).then(function(users) {
        const user = users[0][0];
        res.json({
          id: comment.id,
          comment: comment.comment,
          avatar: user.avatar,
          userName: user.name,
          position: user.Position,
          createdAt: comment.createdAt,
          files: files.map(f => ({ name: f.filename, size: f.size }))
        });
      });
    });
  });
});

module.exports = router;
