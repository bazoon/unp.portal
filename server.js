require("dotenv").config();
const path = require("path");
const querystring = require("querystring");
const fs = require("fs");
const Koa = require("koa");
const cors = require("@koa/cors");
const koaJwt = require("koa-jwt");
const jwt = require("jsonwebtoken");
const serve = require("koa-static");
const send = require("koa-send");
const Router = require("koa-router");
const mount = require("koa-mount");
const router = new Router();
const koaBody = require("koa-body");
const uploadFiles = require("./utils/uploadFiles");
const models = require("./models");

const app = new Koa();
app.use(cors());
const http = require("http").Server(app.callback());
const https = require("https");

const ioServer = require("socket.io");
const io = new ioServer();
const h = https
  .createServer(
    {
      key: fs.readFileSync("./ssl/server.key"),
      cert: fs.readFileSync("./ssl/server.cert")
    },
    app.callback()
  )
  .listen(5443, () => {
    console.log("Listening at :5443...");
  });

io.attach(h);
io.attach(http);

const apiRouter = require("./routes/router");
const userRouter = require("./routes/api/user");
const testRouter = require("./routes/api/test");
const settingsRouter = require("./routes/api/settings");

const port = process.env.PORT || 5000;
const chatFactory = require("./chat/index");
const chat = new chatFactory(io);
const eventReminder = require("./utils/eventReminder");
eventReminder.setChat(chat);

app.use(koaBody());
app.use(serve("client/dist"));
app.use(mount("/uploads", serve("uploads")));

app.use(testRouter.routes()).use(testRouter.allowedMethods());
app.use(settingsRouter.routes()).use(settingsRouter.allowedMethods());

app.use(async (ctx, next) => {
  const requestPath = ctx.request.path;
  const { token, groupName } = ctx.query;
  if (requestPath.indexOf("login/oauth") > 0) {
    ctx.cookies.set("token", token, { httpOnly: false });

    try {
      jwt.verify(token, process.env.API_TOKEN);
      console.log("token verified");
    } catch (e) {
      console.log("Failed verification", e);
    }

    if (groupName) {
      const group = await models.ProjectGroup.findOne({
        where: {
          title: groupName
        }
      });
      if (group) {
        ctx.redirect(`/groups/${group.id}`);
      } else {
        const q = querystring.escape(groupName);
        ctx.redirect(`/groups/new/${q}`);
      }
    } else {
      const userData = getUserData(token);
      const user = await createUserIfNotExist(userData);
      ctx.redirect(`/admin/users/view/${user.id}`);
    }
  } else {
    return await next();
  }
});

app.use(async (ctx, next) => {
  const requestPath = ctx.request.path;
  if (requestPath.indexOf("api") > 0 || requestPath.indexOf("socket.io") > 0) {
    return await next();
  }
  await send(ctx, path.resolve("/client/dist", "index.html"));
});

app.use(userRouter.routes()).use(userRouter.allowedMethods());

app.use(koaJwt({ secret: process.env.API_TOKEN }));

app.use(async (ctx, next) => {
  const token = ctx.request.header.authorization || "";
  const tokenOnly = token.split(" ")[1];
  if (tokenOnly) {
    const userData = getUserData(tokenOnly);
    ctx.user = await createUserIfNotExist(userData);
    await next();
  }
});

app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

http.listen(port, () => console.log(`Server is running on ${port}`));

function getUserData(token) {
  const userDataKey =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata";
  const decoded = jwt.verify(token, process.env.API_TOKEN);
  const userData = decoded[userDataKey];
  return typeof userData === "string" ? JSON.parse(userData) : userData;
}

async function createUserIfNotExist(userData) {
  const userResult = await models.User.findOrCreate({
    where: {
      login: userData.Login
    },
    defaults: {
      name: userData.PersonasFullName,
      login: userData.Login,
      email: userData.Email
    }
  });
  return userResult[0];
}
