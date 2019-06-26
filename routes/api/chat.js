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
const { fileOwners } = require("../../utils/constants");

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
  const userId = ctx.user.id;

  const query = `select distinct channels.name, channels.avatar, channels.id,
                channels.first_user_id, channels.second_user_id
                from channels, user_channels
                where (user_channels.channel_id = channels.id and user_channels.user_id = ${userId}) or 
 	              (channels.first_user_id = ${userId}) or (channels.second_user_id = ${userId})`;

  const [channels] = await models.sequelize.query(query);

  const promises = channels.map(async channel => {
    console.log(channel.first_user_id, channel.second_user_id);
    if (channel.first_user_id && channel.second_user_id) {
      if (channel.first_user_id == userId) {
        return models.User.findOne({
          where: { id: channel.second_user_id }
        }).then(user => {
          return {
            id: channel.id,
            avatar: getUploadFilePath(user.avatar),
            name: user.name
          };
        });
      } else {
        return models.User.findOne({
          where: { id: channel.first_user_id }
        }).then(user => {
          return {
            id: channel.id,
            avatar: getUploadFilePath(user.avatar),
            name: user.name
          };
        });
      }
    }

    const messageQuery = `select message from messages 
                          where channel_id=${channel.id} 
                          order by created_at desc
                          limit 1`;
    const messageResult = await models.sequelize.query(messageQuery);
    const message = messageResult[0][0] && messageResult[0][0].message;

    return Promise.resolve({
      id: channel.id,
      name: channel.name,
      avatar: getUploadFilePath(channel.avatar),
      lastMessage: message
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
  const { selectedUserId } = ctx.request.body;
  const userId = ctx.user.id;

  const user = await models.User.findOne({ where: userId });

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
          firstUser: {
            id: userId,
            name: user.name,
            avatar: getUploadFilePath(user.avatar)
          },
          secondUser: {
            id: selectedUserId,
            name: selectedUser.name,
            avatar: getUploadFilePath(selectedUser.avatar)
          }
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
  const filesQuery = `select files.id, files.file, files.size
                      from files
                      where files.entity_id = ${message.id}`;
  return models.sequelize.query(filesQuery).then(function(messageFiles) {
    return messageFiles[0];
  });
}

router.get("/messages", async ctx => {
  const { channelId, currentPage, lastMessageId } = ctx.request.query;

  const limit = 20;
  const offset = limit * (currentPage - 1);

  let query;

  // Используем id последнего сообщения чтобы не посылать дублирующие записи
  // такая ситуация может возникнуть если загрузили первые сообщения, ввели новое сообщение
  // и потом снова подгрузили
  if (lastMessageId) {
    query = `select distinct messages.id, message, type, messages.user_id, name,
            avatar, messages.created_at, seen from messages 
            join users on (messages.user_id = users.id)
            left join reads on (reads.message_id = messages.id) 
            where (messages.channel_id = ${channelId}) and (messages.id < ${lastMessageId})
            order by messages.created_at desc
            limit ${limit} offset ${offset}`;
  } else {
    query = `select distinct messages.id, message, type, messages.user_id, name,
            avatar, messages.created_at, seen from messages 
            join users on (messages.user_id = users.id)
            left join reads on (reads.message_id = messages.id) 
            where (messages.channel_id = ${channelId})
            order by messages.created_at desc
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
            url: getUploadFilePath(f.file),
            name: f.file,
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
  const userId = ctx.user.id;
  const { file } = ctx.request.files;
  const files = file ? (Array.isArray(file) ? file : [file]) : [];
  await uploadFiles(files);

  const message = await models.Message.create({
    message: null,
    type: "file",
    ChannelId: channelId,
    UserId: userId
  });

  const createdFiles = await models.File.bulkCreate(
    files.map(f => {
      return {
        file: f.name,
        size: f.size,
        entityType: fileOwners.message,
        entityId: message.id,
        userId
      };
    }),
    { returning: true }
  );

  ctx.body = {
    id: message.id,
    channelId,
    files: createdFiles
  };
});

module.exports = router;
