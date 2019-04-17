const express = require("express");
const router = express.Router();

router.get("/list/all", (req, res) => {
  const models = require("../../models");
  models.User.findAll().then(users => {
    res.json(users);
  });
});

module.exports = router;
