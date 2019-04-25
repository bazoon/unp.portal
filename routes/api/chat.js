const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const faker = require("faker");
const models = require("../../models");
const fileName = __dirname + "/chat.json";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const koaBody = require("koa-body");
const getUploadFilePath = require("../../utils/getUploadFilePath");
const uploadFiles = require("../../utils/uploadFiles");

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

const users = [
  {
    name: "Петров Петр",
    avatar: "https://randomuser.me/api/portraits/men/21.jpg"
  },
  {
    name: "Иванов Семен",
    avatar: "https://randomuser.me/api/portraits/men/79.jpg"
  },
  {
    name: "Круглов Андрей",
    avatar: "https://randomuser.me/api/portraits/men/20.jpg"
  },
  {
    name: "Соколова Виктория",
    avatar: "https://randomuser.me/api/portraits/women/40.jpg"
  },
  {
    name: "Сидорова Анна",
    avatar: "https://randomuser.me/api/portraits/women/0.jpg"
  },
  {
    name: "Лукина Мария",
    avatar: "https://randomuser.me/api/portraits/women/72.jpg"
  }
];

function getRandomUser() {
  return users[Math.floor(Math.random() * users.length)];
}

router.get("/channels/all", async (ctx, next) => {
  const response = await models.Channel.findAll({
    where: { private: { [Op.not]: true } }
  }).then(channels => {
    return channels.map(channel => {
      return {
        id: channel.id,
        name: channel.name,
        avatar: getUploadFilePath(channel.avatar)
      };
    });
  });

  ctx.body = response;
});

router.get("/channels", async (ctx, next) => {
  const { userId } = ctx.request.query;

  const query = `select distinct "Channels"."name", "Channels"."avatar", "Channels"."id",
                "Channels"."firstUserId", "Channels"."secondUserId"
                from "Channels", "UserChannels"
                where ("UserChannels"."channelId" = "Channels"."id" and "UserChannels"."userId" = ${userId}) or 
 	              ("Channels"."firstUserId" = ${userId}) or ("Channels"."secondUserId" = ${userId})`;

  const promise = models.sequelize.query(query).then(function(c) {
    return c[0].map(channel => {
      if (channel.firstUserId && channel.secondUserId) {
        if (channel.firstUserId == userId) {
          return models.User.findOne({
            where: { id: channel.secondUserId }
          }).then(user => {
            return {
              id: channel.id,
              avatar: getUploadFilePath(user.avatar),
              name: user.name
            };
          });
        } else {
          return models.User.findOne({
            where: { id: channel.firstUserId }
          }).then(user => {
            return {
              id: channel.id,
              avatar: getUploadFilePath(user.avatar),
              name: user.name
            };
          });
        }
      }

      return Promise.resolve({
        id: channel.id,
        name: channel.name,
        avatar: getUploadFilePath(channel.avatar)
      });
    });
  });

  const channelsPromise = await promise.then(r => {
    return Promise.all(r).then(channels => {
      return channels;
    });
  });

  const channels = await channelsPromise;
  console.log(77, channels);
  ctx.body = channels;
});

router.post("/channels/create", koaBody({ multipart: true }), async ctx => {
  const { channelTitle, userId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  const avatar = files[0].name;
  await uploadFiles(files);
  const result = await models.Channel.create({
    name: channelTitle,
    avatar: avatar
  }).then(channel => {
    return models.UserChannel.create({
      channelId: channel.id,
      userId
    }).then(() => {
      return {
        id: channel.id,
        avatar: getUploadFilePath(channel.avatar),
        name: channel.name
      };
    });
  });
  ctx.body = result;
});

router.post("/channels/createPrivate", async ctx => {
  const { selectedUserId, userId } = ctx.request.body;

  const result = await models.User.findOne({
    where: { id: selectedUserId }
  }).then(selectedUser => {
    return models.Channel.create({
      name: selectedUserId + userId,
      avatar: "",
      firstUserId: userId,
      secondUserId: selectedUserId,
      private: true
    }).then(channel => {
      return models.UserChannel.bulkCreate([
        {
          channelId: channel.id,
          userId
        },
        {
          channelId: channel.id,
          selectedUserId
        }
      ]).then(() => {
        return {
          id: channel.id,
          avatar: getUploadFilePath(selectedUser.avatar),
          name: selectedUser.name
        };
      });
    });
  });
  ctx.body = result;
});

function getMessageFiles(message) {
  if (message.type !== "file") return Promise.resolve([]);
  const filesQuery = `select "Files"."id", "Files"."file", "Files"."size"
                      from "Files", "MessageFiles"
                      where ("Files"."id" = "MessageFiles"."FileId") and "MessageFiles"."MessageId" = ${
                        message.id
                      }`;
  return models.sequelize.query(filesQuery).then(function(messageFiles) {
    return messageFiles[0];
  });
}

router.get("/messages", async ctx => {
  const { channelId, currentPage, lastMessageId } = ctx.request.query;

  const limit = 5;
  const offset = limit * (currentPage - 1);

  let query;

  // Используем id последнего сообщения чтобы не посылать дублирующие записи
  // такая ситуация может возникнуть если загрузили первые сообщения, ввели новое сообщение
  // и потом снова подгрузили
  if (lastMessageId) {
    query = `select distinct "Messages"."id", message, type, "Messages"."UserId", "name",
            "avatar", "Messages"."createdAt", seen from "Messages" 
            join "Users" on ("Messages"."UserId" = "Users"."id")
            left join "Reads" on ("Reads"."MessageId" = "Messages"."id") 
            where ("Messages"."ChannelId" = ${channelId}) and ("Messages"."id" < ${lastMessageId})
            order by "Messages"."createdAt" desc
            limit ${limit} offset ${offset}`;
  } else {
    query = `select distinct "Messages"."id", message, type, "Messages"."UserId", "name",
            "avatar", "Messages"."createdAt", seen from "Messages" 
            join "Users" on ("Messages"."UserId" = "Users"."id")
            left join "Reads" on ("Reads"."MessageId" = "Messages"."id") 
            where ("Messages"."ChannelId" = ${channelId})
            order by "Messages"."createdAt" desc
            limit ${limit} offset ${offset}`;
  }

  const result = await models.sequelize.query(query).then(function(messages) {
    return messages[0].reverse().map(message => {
      return getMessageFiles(message).then(messageFiles => {
        return {
          id: message.id,
          message: message.message,
          type: message.type,
          userName: message.name,
          avatar: getUploadFilePath(message.avatar),
          createdAt: message.createdAt,
          seen: message.seen,
          files: messageFiles.map(f => ({
            id: f.id,
            file: getUploadFilePath(f.file),
            size: f.size
          }))
        };
      });
    });
  });
  ctx.body = await Promise.all(result);
});

router.get("/list", (req, res) => {
  const readable = fs.createReadStream(fileName, "utf8");
  res.set({ "content-type": "application/json; charset=utf-8" });
  readable
    .pipe(jsonStream.parse("*"))
    .pipe(jsonStream.stringify())
    .pipe(res);
});

router.get("/more", (req, res) => {
  const { activeChannelId } = req.query;
  const messages = [];

  for (let i = 0; i < 10; i++) {
    let user = getRandomUser();
    messages.push({
      id: i + Math.round(Math.random() * i * 100) + 119818,
      type: "text",
      date: "2019-03-20T03:48:14.482Z",
      avatar: getUploadFilePath(user.avatar),
      author: user.name,
      content: faker.lorem.paragraphs(Math.round(Math.random() * 2) + 1)
    });
  }

  res.json({
    activeChannelId,
    messages
  });
});

router.post("/send", (req, res) => {
  const id = req.body.channelId;
  const text = req.body.message;
  const type = req.body.type;
});

// Uploads
router.post("/upload", koaBody({ multipart: true }), async ctx => {
  const { channelId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const createdFiles = await models.File.bulkCreate(
    files.map(f => {
      return {
        file: f.name,
        size: f.size
      };
    }),
    { returning: true }
  );

  ctx.body = {
    channelId,
    files: createdFiles
  };
});

module.exports = router;
