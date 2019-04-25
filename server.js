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

const multer = require("multer");

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// app.use(eventsRouter.routes());
// app.use(eventsRouter.allowedMethods());

// app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
// app.use("/downloads", express.static(path.join(__dirname, "/downloads")));

// console.log(apiRouter);

app.use(apiRouter.routes()).use(apiRouter.allowedMethods());

const chat = new chatFactory(io);

// client / dist;
app.use(serve("client/dist"));
// app.use(serve("uploads"));

app.use(mount("/uploads", serve("uploads")));

// app.get("*", function(request, response) {
//   console.log(request.url);
//   response.sendFile(path.resolve(__dirname + "/client/dist", "index.html"));
// });

app.use(async ctx => {
  // if (ctx.path != "/") {
  //   // console.log(111, "/client/dist" + ctx.path);
  //   await send(ctx, "/client/dist" + ctx.path);
  // } else {
  await send(ctx, path.resolve("/client/dist", "index.html"));
  // }
});

// models.sequelize.sync().then(function() {
// getPosts().then(posts => {
//   console.log(posts);
// });

// models.ProjectGroup.findOne({ where: { id: 9919 } }).then(r => {
//   console.log(r);
// });

// models.sequelize.query('select *from "Users"').then(function(users) {
//   console.log(users);
// });

// models.ProjectGroup.findByPk(1).then(function(pg) {
// pg.getParticipants().then(ps => {
//   console.log(ps);
// });
// });

// models.Channel.findByPk(5, {
//   include: {
//     model: models.Message,
//     as: "Messages"
//   },
//   order: [[{ model: models.Message, as: "Messages" }, "createdAt", "DESC"]]
// }).then(channel => {
//   channel.Messages.forEach(function(m) {
//     console.log(m.createdAt);
//   });
// });

// models.Message.findByPk(1, { include: { model: models.User } }).then(m => {
//   console.log(m.User);
// });

// app.listen(port);
// var server = http.createServer(app.callback());
http.listen(port, () => console.log(`Server is running on ${port}`));
// });
