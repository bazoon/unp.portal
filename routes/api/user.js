const express = require("express");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jsonStream = require("JSONStream");
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

  fs.readFile(fileName, "utf8", function(err, content) {
    if (!err) {
      const users = JSON.parse(content);
      const user = users.find(u => u.name === userName);

      if (!user) {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const lastUser = users[users.length - 1];
        const lastId = lastUser ? lastUser.id : 0;
        const newUser = {
          id: lastId + 1,
          name: userName,
          password: hashedPassword
        };
        users.push(newUser);
        fs.writeFile(fileName, JSON.stringify(users), function(err) {
          if (!err) {
            res.json({
              token,
              userName
            });
          }
        });
      } else {
        bcrypt.compare(password, user.password, function(err, isCorrect) {
          if (!err && isCorrect) {
            res.json({
              token,
              userName
            });
          } else {
            res
              .status(403)
              .send({ auth: false, message: "Неправильный логин или пароль" });
          }
        });
      }
    }
  });
});

module.exports = router;
