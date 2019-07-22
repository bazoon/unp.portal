require("dotenv").config();
const path = require("path");
const fs = require("fs");
const Koa = require("koa");
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
const http = require("http").Server(app.callback());
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
  if (requestPath.indexOf("api") > 0 || requestPath.indexOf("graphql") > 0) {
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
    const { id } = jwt.verify(tokenOnly, process.env.API_TOKEN);
    ctx.user = await models.User.findOne({
      where: {
        id
      }
    });

    console.log("ctx.user.isAdmin", ctx.user.isAdmin);
    await next();
  }
});

app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

// models.sequelize.sync().then(function() {
http.listen(port, () => console.log(`Server is running on ${port}`));
// });
