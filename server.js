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

const io = require("socket.io")(http);
const apiRouter = require("./routes/router");
const authRouter = require("./routes/authRouter");
const testRouter = require("./routes/api/test");
const eventsRouter = require("./routes/api/events");

const port = process.env.PORT || 5000;
const chatFactory = require("./chat/index");
const chat = new chatFactory(io);
const eventReminder = require("./utils/eventReminder");
eventReminder.setChat(chat);

app.use(koaBody());
app.use(serve("client/dist"));
app.use(mount("/uploads", serve("uploads")));

app.use(testRouter.routes()).use(testRouter.allowedMethods());

app.use(async (ctx, next) => {
  const requestPath = ctx.request.path;
  const { token, groupName } = ctx.query;
  if (requestPath.indexOf("login/oauth") > 0) {
    ctx.cookies.set("token", token, { httpOnly: false });

    console.log(token, groupName);
    console.log(process.env.API_TOKEN);
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
      ctx.redirect("/");
    }
  } else {
    return await next();
  }
});

app.use(async (ctx, next) => {
  const requestPath = ctx.request.path;
  if (requestPath.indexOf("api") > 0) {
    return await next();
  }
  await send(ctx, path.resolve("/client/dist", "index.html"));
});

app.use(authRouter.routes()).use(authRouter.allowedMethods());

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

// const decoded = jwt.decode(
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjE3IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy91c2VyZGF0YSI6IntcIk5hbWVcIjpcImFkbWluXCIsXCJFbWFpbFwiOlwiYmZvLWViLXNlbmRwYXNzQGJhcnMuZ3JvdXBcIixcIkxvZ2luXCI6XCJhZG1pblwiLFwiX2JhcnNUcmFja2luZ1wiOlwiOGMxN2Q4NDllNzJkNDZlZDg3MmE1Y2E1YjY0YmM3MzlcIixcIlVzZXJOYW1lXCI6XCJhZG1pblwiLFwiQXVkaXRVc2VyTmFtZVwiOlwi0KHQuNGB0YLQtdC80L3Ri9C5INCQ0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGAIFwiLFwiQXVkaXRVc2VyTG9naW5cIjpcImFkbWluXCIsXCJBdWRpdFVzZXJPcmdhbml6YXRpb25cIjpudWxsLFwiRXh0ZXJuYWxJZFwiOjEyNCxcIlBlcnNvbmFzRnVsbE5hbWVcIjpcItCh0LjRgdGC0LXQvNC90YvQuSDQkNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgCBcIixcIlVzZXJJZFwiOjE3fSIsIl9iYXJzVHJhY2tpbmciOiI4YzE3ZDg0OWU3MmQ0NmVkODcyYTVjYTViNjRiYzczOSIsImV4cCI6MTU2NDU2MDU4NywiaXNzIjoiYnVkZ2V0cGxhbiIsImF1ZCI6ImJ1ZGdldHBsYW4ifQ.bFddtNYhRCA6NoKM6IoUNU27ZhEvRHU-9wSexRk_N6U"
// );

// console.log(
//   decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata"]
// );

// const d = jwt.verify(
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjE3IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkbWluIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy91c2VyZGF0YSI6IntcIk5hbWVcIjpcImFkbWluXCIsXCJFbWFpbFwiOlwiYmZvLWViLXNlbmRwYXNzQGJhcnMuZ3JvdXBcIixcIkxvZ2luXCI6XCJhZG1pblwiLFwiX2JhcnNUcmFja2luZ1wiOlwiOGMxN2Q4NDllNzJkNDZlZDg3MmE1Y2E1YjY0YmM3MzlcIixcIlVzZXJOYW1lXCI6XCJhZG1pblwiLFwiQXVkaXRVc2VyTmFtZVwiOlwi0KHQuNGB0YLQtdC80L3Ri9C5INCQ0LTQvNC40L3QuNGB0YLRgNCw0YLQvtGAIFwiLFwiQXVkaXRVc2VyTG9naW5cIjpcImFkbWluXCIsXCJBdWRpdFVzZXJPcmdhbml6YXRpb25cIjpudWxsLFwiRXh0ZXJuYWxJZFwiOjEyNCxcIlBlcnNvbmFzRnVsbE5hbWVcIjpcItCh0LjRgdGC0LXQvNC90YvQuSDQkNC00LzQuNC90LjRgdGC0YDQsNGC0L7RgCBcIixcIlVzZXJJZFwiOjE3fSIsIl9iYXJzVHJhY2tpbmciOiI4YzE3ZDg0OWU3MmQ0NmVkODcyYTVjYTViNjRiYzczOSIsImV4cCI6MTU2NDU2MDU4NywiaXNzIjoiYnVkZ2V0cGxhbiIsImF1ZCI6ImJ1ZGdldHBsYW4ifQ.bFddtNYhRCA6NoKM6IoUNU27ZhEvRHU-9wSexRk_N6U",
//   "5A0AB091-3F84-4EC4-B227-0834FCD8B1B4"
// );

// console.log(d);
// models.sequelize.sync().then(function() {
http.listen(port, () => console.log(`Server is running on ${port}`));
// });

https
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

function getUserData(token) {
  const userDataKey =
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/userdata";
  const decoded = jwt.verify(token, process.env.API_TOKEN);
  const userData = decoded[userDataKey];
  // console.log("DECODED", decoded, typeof userData);
  return typeof userData === "string" ? JSON.parse(userData) : userData;
}

async function createUserIfNotExist(userData) {
  const userResult = await models.User.findOrCreate({
    where: {
      email: userData.Email
    },
    defaults: {
      name: userData.PersonasFullName,
      login: userData.Login,
      email: userData.Email
    }
  });
  return userResult[0];
}
