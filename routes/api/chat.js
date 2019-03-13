const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/chat.json";

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.post("/send", (req, res) => {
  fs.readFile(fileName, "utf8", function(err, contents) {
    if (!err) {
      const chat = JSON.parse(contents);
      const id = req.body.channelId;
      const text = req.body.message;
      const type = req.body.type;
      const item = chat.find(i => i.id == id);

      console.log("ITEM", item, id);

      const last =
        item.messages.length > 0
          ? item.messages[item.messages.length - 1]
          : undefined;

      item.messages.push({
        id: last ? last.id + 1 : 1,
        type,
        date: new Date(),
        author: "Соколова Виктория",
        content: text
      });

      fs.writeFile(fileName, JSON.stringify(chat), function(err) {
        if (!err) {
          res.json("Ok");
        }
      });
    }
  });
});

module.exports = router;
