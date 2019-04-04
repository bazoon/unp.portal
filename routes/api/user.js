const express = require("express");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jsonStream = require("JSONStream");
const models = require("../../models");
const secret = "Some secret key";
const fileName = __dirname + "/users.json";
const expiresIn = 60 * 60 * 24;

router.post("/login", (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  if (!userName || !password) {
    return res.json("enter password and username!");
  }
  const token = jwt.sign({ userName }, secret, { expiresIn: expiresIn });

  models.User.findOne({ where: { name: userName } })
    .then(user => {
      const hashedPassword = bcrypt.hashSync(password, 8);
      bcrypt.compare(password, user.password, (err, isCorrect) => {
        if (isCorrect) {
          res.json({
            userId: user.id,
            token,
            userName,
            avatar: user.avatar
          });
        } else {
          res.status(403).json({
            auth: false,
            message: "Неправильный логин или пароль"
          });
        }
      });
    })
    .catch(() => {
      console.log("404");
    });
});

router.post("/signup", (req, res) => {
  const userName = req.body.userName;
  const password = req.body.password;

  if (!userName || !password) {
    return res.json("enter password and username!");
  }
  const token = jwt.sign({ userName }, secret, { expiresIn: expiresIn });

  models.User.findOrCreate({ where: { name: userName } }).then(
    ([user, created]) => {
      const hashedPassword = bcrypt.hashSync(password, 8);
      const avatarId = getRandomArbitrary(0, 70);
      const avatar = `http://i.pravatar.cc/150?img=${avatarId}`;

      user.update({ name: userName, password: hashedPassword, avatar });
      res.json({
        userId: user.id,
        token,
        userName,
        avatar
      });
    }
  );
});

module.exports = router;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
