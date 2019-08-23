const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const models = require("../../models");
const { log } = require("../../utils/log");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const expiresIn = 60 * 60 * 24;
const {
  MissingFieldError,
  LoginFailedError,
  NotFoundRecordError
} = require("../../utils/errors");

async function login(login, password, ctx, transaction) {
  const userDataKey =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata";

  const user = await models.User.findOne({ where: { login } });

  if (!user) {
    throw new NotFoundRecordError("Пользователь не найден");
  }

  const payload = {
    [userDataKey]: {
      PersonasFullName: user.name,
      Login: user.login,
      Email: user.email
    }
  };

  const token = jwt.sign(payload, process.env.API_TOKEN, {
    expiresIn: expiresIn
  });

  const hashedPassword = bcrypt.hashSync(password, 8);
  const isCorrect = await bcrypt.compare(password, user.password);

  if (isCorrect) {
    ctx.cookies.set("token", token, { httpOnly: false });
    return {
      userId: user.id,
      token,
      isAdmin: user.isAdmin,
      userName: user.name,
      avatar: getUploadFilePath(user.avatar)
    };
  } else {
    throw new LoginFailedError("Неправильный логин или пароль!");
  }
}

router.post("/login", async ctx => {
  const { userName, password } = ctx.request.body;
  try {
    if (!userName || !password) {
      throw MissingFieldError("Name or password missing!");
    }

    ctx.body = await login(userName, password, ctx);
  } catch (e) {
    ctx.body = e.message;
    ctx.status = e.status || 500;
  }
});

router.post("/logout", async ctx => {
  ctx.cookies.set("token", "", { httpOnly: false });
  ctx.body = "ok";
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
  let transaction;

  try {
    transaction = await models.sequelize.transaction();

    if (!userName || !password) {
      throw MissingFieldError("Name or password missing!");
    }

    const [user, created] = await models.User.findOrCreate({
      where: { name: userName },
      transaction
    });

    user.update(
      {
        email,
        login
      },
      { transaction }
    );

    const hashedPassword = bcrypt.hashSync(password, 8);

    const avatar = "";

    user.update(
      { name: userName, password: hashedPassword, avatar },
      { transaction }
    );

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
