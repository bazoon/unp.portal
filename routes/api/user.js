const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const models = require("../../models");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const fileName = __dirname + "/users.json";
const expiresIn = 60 * 60 * 24;

async function login(login, password) {
  const user = await models.User.findOne({ where: { login } });

  if (!user) {
    ctx.status = 404;
    return;
  }

  const token = jwt.sign(
    { userName: user.name, id: user.id, isAdmin: user.isAdmin },
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
      userName: user.name,
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
  const {
    firstName,
    surName,
    lastName,
    email,
    login,
    password
  } = ctx.request.body;
  const userName = `${surName} ${firstName} ${lastName}`;

  if (!userName || !password) {
    ctx.status = 500;
    ctx.body = "enter password and username!";
  }

  try {
    const [user, created] = await models.User.findOrCreate({
      where: { name: userName }
    });

    user.update({
      email,
      login
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
