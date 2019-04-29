const Koa = require("koa");
const serve = require("koa-static");
const send = require("koa-send");
const Router = require("koa-router");
const mount = require("koa-mount");
const router = new Router();
const koaBody = require("koa-body");
const uploadFiles = require("./utils/uploadFiles");

const app = new Koa();

const path = require("path");
const apiRouter = require("./routes/router");

const eventsRouter = require("./routes/api/events");

var http = require("http").Server(app.callback());

var io = require("socket.io")(http);
const models = require("./models");

const port = process.env.PORT || 5000;
const chatFactory = require("./chat/index");
const chat = new chatFactory(io);

app.use(koaBody());
app.use(apiRouter.routes()).use(apiRouter.allowedMethods());
app.use(serve("client/dist"));
app.use(mount("/uploads", serve("uploads")));

app.use(async ctx => {
  await send(ctx, path.resolve("/client/dist", "index.html"));
});

http.listen(port, () => console.log(`Server is running on ${port}`));
