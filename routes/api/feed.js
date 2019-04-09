const express = require("express");
const router = express.Router();
const fs = require("fs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const models = require("../../models");

router.get("/group_posts", (req, res) => {
  const { userId } = req.query;
  const query = `select "ProjectGroups"."title","Posts"."id", 
              "Posts"."text", "Posts"."createdAt", "Posts"."ParentId",
              "Users"."avatar", "Users"."name"
              from "ProjectGroups", "Participants", "Conversations", "Posts", "Users"
              where "ProjectGroups"."id" = "Participants"."ProjectGroupId" and
              "Participants"."UserId" = ${userId} and
              "Conversations"."ProjectGroupId" = "ProjectGroups"."id" and
              "Posts"."ConversationId" = "Conversations"."id" and
              "Posts"."UserId"="Users"."id" 
              order by "Posts"."createdAt" desc
              `;

  const promise = models.sequelize.query(query).then(function(posts) {
    const postsLookup = {};
    posts[0].forEach(post => {
      postsLookup[post.id] = post;
    });

    const postsTree = posts[0].reduce((acc, post) => {
      if (post.ParentId) {
        const parentPost = postsLookup[post.ParentId];
        parentPost.children = parentPost.children || [];
        parentPost.children.push(post);
        return acc;
      }
      return acc.concat([post]);
    }, []);

    res.json(postsTree);
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
