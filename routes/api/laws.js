const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(__dirname + "/laws.json", "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

module.exports = router;
