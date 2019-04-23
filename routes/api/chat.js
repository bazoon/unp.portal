const Router = require("koa-router");
const router = new Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const faker = require("faker");
const models = require("../../models");
const fileName = __dirname + "/chat.json";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

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
        avatar: channel.avatar
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
              avatar: user.avatar,
              name: user.name
            };
          });
        } else {
          return models.User.findOne({
            where: { id: channel.firstUserId }
          }).then(user => {
            return {
              id: channel.id,
              avatar: user.avatar,
              name: user.name
            };
          });
        }
      }

      return Promise.resolve(channel);
    });
  });

  const channelsPromise = await promise.then(r => {
    return Promise.all(r).then(channels => {
      return channels;
      res.json(channels);
    });
  });

  const channels = await channelsPromise;
  ctx.body = channels;
});

router.post("/channels/create", upload.array("file", 12), function(
  req,
  res,
  next
) {
  const { channelTitle, userId } = req.body;
  const avatar = req.files && req.files[0] && req.files[0].filename;
  models.Channel.create({
    name: channelTitle,
    avatar: avatar
  }).then(channel => {
    models.UserChannel.create({
      channelId: channel.id,
      userId
    }).then(() => res.json(channel));
  });
});

router.post("/channels/createPrivate", function(req, res, next) {
  const { selectedUserId, userId } = req.body;
  console.log(selectedUserId, userId);
  models.User.findOne({ where: { id: selectedUserId } }).then(selectedUser => {
    models.Channel.create({
      name: selectedUserId + userId,
      avatar: "",
      firstUserId: userId,
      secondUserId: selectedUserId,
      private: true
    }).then(channel => {
      models.UserChannel.bulkCreate([
        {
          channelId: channel.id,
          userId
        },
        {
          channelId: channel.id,
          selectedUserId
        }
      ]).then(() =>
        res.json({
          id: channel.id,
          avatar: selectedUser.avatar,
          name: selectedUser.name
        })
      );
    });
  });
});

router.get("/messages", (req, res) => {
  const { channelId, currentPage, lastMessageId } = req.query;

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

  models.sequelize.query(query).then(function(messages) {
    res.json(
      messages[0].reverse().map(message => {
        return {
          id: message.id,
          message: message.message,
          type: message.type,
          userName: message.name,
          avatar: message.avatar,
          createdAt: message.createdAt,
          seen: message.seen
        };
      })
    );
  });
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
      avatar: user.avatar,
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

module.exports = router;
