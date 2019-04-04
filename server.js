const express = require("express");
const path = require("path");
const app = express();
const apiRouter = require("./routes/router");
var http = require("http").Server(app);

var io = require("socket.io")(http);
const models = require("./models");

const port = process.env.PORT || 5000;
const chatFactory = require("./chat/index");

const bodyParser = require("body-parser");
const multer = require("multer");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.use("/api", apiRouter);

app.use(express.static("client/dist"));
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));
app.use("/downloads", express.static(path.join(__dirname, "/downloads")));

// io.on("connection", function(socket) {
//   sock = socket;
//   console.log("connected");
//   socket.emit("foo", "look2");
//   socket.on("foo", function(m, fn) {
//     console.log("FOO");
//     socket.broadcast.emit("foo2", "look");
//   });

//   // setInterval(function() {
//   //   socket.emit("foo2", "hello");
//   //   console.log("Emit foo");
//   // }, 3000);
// });

// const Sequelize = require("sequelize");

// // // Option 1: Passing parameters separately
// const connection = new Sequelize("unp_portal", "vn", "t9788886", {
//   host: "localhost",
//   dialect: "postgres"
// });

// connection.sync();

const chat = new chatFactory(io);

// Uploads
app.post("/upload", upload.array("file", 12), function(req, res, next) {
  // console.log(111, req.body);
  const { channelId } = req.body;
  res.send({
    channelId,
    files: req.files
  });
});

function create(i) {
  return models.Message.create({
    message: "hello" + i,
    type: "text",
    ChannelId: 7,
    UserId: 2
  }).then(function() {
    if (i < 100) {
      create(i + 1);
    }
  });
}

async function getPosts() {
  const query = `select "Posts"."id", text, "Users"."name", 
                "Users"."avatar", "Users"."Position", "Posts"."createdAt"
                from "Posts", "Users"
                where ("ConversationId"=1) and ("Posts"."UserId" = "Users"."id")`;

  const posts = await models.sequelize.query(query);

  const f = posts.map(async function(post) {
    const files = await models.PostFile.findAll({ where: { PostId: post.id } });
    return {
      ...post,
      files
    };
  });

  return f;
}

models.sequelize.sync().then(function() {
  // getPosts().then(posts => {
  //   console.log(posts);
  // });

  // models.sequelize.query('select *from "Users"').then(function(users) {
  //   console.log(users);
  // });

  models.ProjectGroup.findByPk(1).then(function(pg) {
    // pg.getParticipants().then(ps => {
    //   console.log(ps);
    // });
  });

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

  http.listen(port, () => console.log(`Server is running on ${port}`));
});
