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
                where ("UserChannels"."ChannelId" = "Channels"."id" and "UserChannels"."UserId" = ${userId}) or 
 	              ("Channels"."firstUserId" = ${userId}) or ("Channels"."secondUserId" = ${userId})`;

  const [channels] = await models.sequelize.query(query);

  const promises = channels.map(channel => {
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

  ctx.body = await Promise.all(promises);
});

router.post("/channels/create", koaBody({ multipart: true }), async ctx => {
  const { channelTitle, userId } = ctx.request.body;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  const avatar = files[0] && files[0].name;
  await uploadFiles(files);
  ctx.body = await models.Channel.create({
    name: channelTitle,
    avatar: avatar
  }).then(channel => {
    return models.UserChannel.create({
      ChannelId: channel.id,
      UserId: userId
    }).then(() => {
      return {
        id: channel.id,
        avatar: getUploadFilePath(channel.avatar),
        name: channel.name
      };
    });
  });
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
          ChannelId: channel.id,
          UserId: userId
        },
        {
          ChannelId: channel.id,
          UserId: selectedUserId
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

router.post("/channels/join", async ctx => {
  const { userId, channelId } = ctx.request.body;

  try {
    await models.UserChannel.findOrCreate({
      where: {
        ChannelId: channelId,
        UserId: userId
      }
    });
  } catch (e) {
    console.log(e);
  }

  const channel = await models.Channel.findByPk(channelId);

  ctx.body = {
    id: channel.id,
    avatar: getUploadFilePath(channel.avatar),
    name: channel.name
  };
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
