const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const fileName = __dirname + "/project_groups.json";

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.get("/get/:id", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");

  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(
      jsonStream.parse("*", function(g) {
        if (g.id == req.params.id) {
          return g;
        }
      })
    )
    .pipe(jsonStream.stringify())
    .pipe(res);
});

module.exports = router;
