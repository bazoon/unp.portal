const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/feed.json";

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
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
