const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const fileName = __dirname + "/users.json";
const expiresIn = 60 * 60 * 24;

async function login(userName, password) {
  const user = await models.User.findOne({ where: { name: userName } });
  const token = jwt.sign(
    { userName, id: user.id, isAdmin: user.isAdmin },
    process.env.API_TOKEN,
    {
      expiresIn: expiresIn
    }
  );
  const hashedPassword = bcrypt.hashSync(password, 8);
  const isCorrect = bcrypt.compare(password, user.password);

  if (isCorrect) {
    return {
      userId: user.id,
      token,
      isAdmin: user.isAdmin,
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

  try {
    const [user, created] = await models.User.findOrCreate({
      where: { name: userName }
    });
    const hashedPassword = bcrypt.hashSync(password, 8);

    const avatar = "";

    user.update({ name: userName, password: hashedPassword, avatar });
    const token = jwt.sign(
      { userName, id: user.id, isAdmin: user.isAdmin },
      process.env.API_TOKEN,
      {
        expiresIn: expiresIn
      }
    );

    ctx.body = {
      userId: user.id,
      isAdmin: user.isAdmin,
      token,
      userName,
      avatar
    };
  } catch (e) {
    ctx.body = e;
  }
});

module.exports = router;

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
