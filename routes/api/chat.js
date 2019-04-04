const express = require("express");
const router = express.Router();
const fs = require("fs");
const jsonStream = require("JSONStream");
const faker = require("faker");
const models = require("../../models");
const fileName = __dirname + "/chat.json";

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

router.get("/channels", (req, res) => {
  models.Channel.findAll().then(channels => {
    res.json(
      channels.map(channel => {
        return {
          id: channel.id,
          name: channel.name,
          avatar: channel.avatar
        };
      })
    );
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

  // fs.readFile(fileName, "utf8", function(err, contents) {
  //   if (!err) {
  //     const chat = JSON.parse(contents);
  //     const id = req.body.channelId;
  //     const text = req.body.message;
  //     const type = req.body.type;
  //     const item = chat.find(i => i.id == id);

  //     const last =
  //       item.messages.length > 0
  //         ? item.messages[item.messages.length - 1]
  //         : undefined;

  //     item.messages.push({
  //       id: last ? last.id + 1 : 1,
  //       type,
  //       date: new Date(),
  //       author: "Соколова Виктория",
  //       content: text
  //     });

  //     fs.writeFile(fileName, JSON.stringify(chat), function(err) {
  //       if (!err) {
  //         res.json("Ok");
  //       }
  //     });
  //   }
  // });
});

module.exports = router;
