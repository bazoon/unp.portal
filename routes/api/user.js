const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const secret = "Some secret key";
const fileName = __dirname + "/users.json";
const expiresIn = 60 * 60 * 24;

async function login(userName, password) {
  const token = jwt.sign({ userName }, secret, { expiresIn: expiresIn });
  const user = await models.User.findOne({ where: { name: userName } });
  const hashedPassword = bcrypt.hashSync(password, 8);
  const isCorrect = bcrypt.compare(password, user.password);

  if (isCorrect) {
    return {
      userId: user.id,
      token,
      userName,
      avatar: getUploadFilePath(user.avatar)
    };
  } else {
    return {
      auth: false,
      message: "Неправильный логин или пароль"
    };
  }
}

router.post("/login", async ctx => {
  console.log(7777, ctx.request.body);
  const { userName, password } = ctx.request.body;

  if (!userName || !password) {
    ctx.body = "enter password and username!";
    return;
  }

  ctx.body = await login(userName, password);
});

router.post("/signup", async ctx => {
  const { userName, password } = ctx.request.body;

  if (!userName || !password) {
    ctx.body = "enter password and username!";
  }
  const token = jwt.sign({ userName }, secret, { expiresIn: expiresIn });

  const result = await models.User.findOrCreate({
    where: { name: userName }
  }).then(([user, created]) => {
    const hashedPassword = bcrypt.hashSync(password, 8);
    const avatarId = getRandomArbitrary(0, 70);
    const avatar = `http://i.pravatar.cc/150?img=${avatarId}`;

    user.update({ name: userName, password: hashedPassword, avatar });
    return {
      userId: user.id,
      token,
      userName,
      avatar: getUploadFilePath(avatar)
    };
  });
  ctx.body = result;
});

module.exports = router;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
