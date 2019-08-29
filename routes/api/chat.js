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
const {
  NotFoundRecordError,
  NotAuthorizedError,
  DuplicateFoundError
} = require("../../utils/errors");

router.get("/channels/search/:query", async (ctx, next) => {
  const userId = ctx.user.id;
  const { query } = ctx.params;
  const sqlQuery = `select distinct(channels.id)
                from channels, user_channels
                where (_search @@ to_tsquery(:query)) and ((user_channels.channel_id = channels.id and user_channels.user_id = :userId) or 
 	              (channels.first_user_id = :userId) or (channels.second_user_id = :userId))`;

  const [channels] = await models.sequelize.query(sqlQuery, {
    replacements: { query: `${query} | ${query}:*`, userId }
  });

  ctx.body = channels.map(c => c.id);
});

router.get("/channels", async (ctx, next) => {
  const userId = ctx.user.id;

  const query = `select distinct channels.name, channels.avatar, channels.id,
                channels.first_user_id, channels.second_user_id, channels.user_id
                from channels, user_channels
                where (user_channels.channel_id = channels.id and user_channels.user_id = :userId) or 
 	              (channels.first_user_id = :userId) or (channels.second_user_id = :userId)`;

  const [channels] = await models.sequelize.query(query, {
    replacements: {
      userId
    }
  });


  ctx.body = await Promise.all(getFullChannels(channels, userId));
});

function getFullChannels(channels, userId) {
  return channels.map(async channel => {
    const messageQuery = `select messages.id, message, name as userName, messages.created_at as createdAt from messages
                          left join users on messages.user_id = users.id
                          where channel_id=:channelId
                          order by messages.created_at desc
                          limit 1`;

    const unreadsQuery = `select count(id) from messages 
                  where channel_id = :channelId and id not in (select message_id from "reads" where user_id = :userId and seen = true)`;

    const participantsCountQuery = `select  count(*) from user_channels where channel_id=:channelId`;

    const messageResult = await models.sequelize.query(messageQuery, {
      replacements: {
        channelId: channel.id
      }
    });
    const message = messageResult[0][0] && messageResult[0][0];
    const lastMessage = message && {
      id: message.id,
      userName: message.username,
      message: message.message,
      createdAt: message.createdat
    };

    const unreadsResult = await models.sequelize.query(unreadsQuery, {
      replacements: {
        channelId: channel.id,
        userId
      }
    });

    const unreads = unreadsResult[0][0] && +unreadsResult[0][0].count;

    const participantsCountResult = await models.sequelize.query(
      participantsCountQuery,
      {
        replacements: {
          channelId: channel.id
        }
      }
    );
    const participantsCount =
      participantsCountResult[0][0] && +participantsCountResult[0][0].count;

    if (channel.first_user_id && channel.second_user_id) {
      if (channel.first_user_id == userId) {
        const user = await models.User.findOne({
          where: { id: channel.second_user_id }
        });

        if (!user) {
          throw new NotFoundRecordError("User not found");
        }

        return {
          id: channel.id,
          private: channel.private,
          avatar: getUploadFilePath(user.avatar),
          name: user.name,
          lastMessage,
          private: true,
          unreads
        };
      } else {
        const user = models.User.findOne({
          where: { id: channel.first_user_id }
        });

        if (!user) {
          throw new NotFoundRecordError("User not found");
        }

        return {
          id: channel.id,
          name: user.name,
          private: channel.private,
          avatar: getUploadFilePath(user.avatar),
          lastMessage,
          private: true,
          unreads
        };
      }
    }


    return Promise.resolve({
      id: channel.id,
      canManage: channel.user_id == userId,
      name: channel.name,
      avatar: getUploadFilePath(channel.avatar),
      lastMessage,
      unreads,
      participantsCount
    });
  });
}

router.post("/seen", async ctx => {
  const { messageId } = ctx.request.body;
  const userId = ctx.user.id;

  const a = await models.Read.findOrCreate({
    where: {
      messageId,
      userId
    },
    defaults: {
      messageId,
      userId,
      seen: true
    }
  });

  ctx.body = "ok";
});

router.post("/channels", koaBody({ multipart: true }), async ctx => {
  const { channelName, usersIds } = ctx.request.body;
  const userId = ctx.user.id;
  const Op = Sequelize.Op;

  const { channelAvatar } = ctx.request.files;
  const files = channelAvatar
    ? Array.isArray(channelAvatar)
      ? channelAvatar
      : [channelAvatar]
    : [];
  const avatar = files[0] && files[0].name;
  await uploadFiles(files);

  const usersIdsWithUser = Array.from(
    new Set(JSON.parse(usersIds).concat([userId + '']))
  );

  const channel = await models.Channel.create({
    name: channelName,
    avatar: avatar
  });

  await models.UserChannel.bulkCreate(
    usersIdsWithUser.map(id => {
      return {
        ChannelId: channel.id,
        UserId: id
      };
    }),
    { returning: true }
  );

  const participants = await getChannelUsers(channel.id);

  ctx.body = {
    channel: {
      id: channel.id,
      name: channel.name,
      avatar: getUploadFilePath(channel.avatar),
      participants,
    },
    usersIds: usersIdsWithUser
  };
});

router.post("/channels/createPrivate", async ctx => {
  const { selectedUserId } = ctx.request.body;
  const userId = ctx.user.id;
  const user = await models.User.findOne({ where: userId });
  const selectedUser = await models.User.findOne({ where: selectedUserId });
  let channelAlreadyExists;

  let channel = await models.Channel.findOne({
    where: {
      firstUserId: userId,
      secondUserId: selectedUserId
    }
  });

  if (!channel) {
    channel = await models.Channel.create({
      firstUserId: userId,
      secondUserId: selectedUserId,
      name: `${user.name}:${selectedUser.name}`,
      avatar: "",
      firstUserId: userId,
      secondUserId: selectedUserId,
      private: true
    });
  }

  let userChannel = await models.UserChannel.findOne({
    where: {
      ChannelId: channel.id,
      UserId: userId
    },
    defaults: {
      ChannelId: channel.id,
      UserId: userId
    }
  });

  if (!userChannel) {
    userChannel = await models.UserChannel.create({
      ChannelId: channel.id,
      UserId: userId
    });
  } else {
    channelAlreadyExists = true;
  }

  await models.UserChannel.findOrCreate({
    where: {
      ChannelId: channel.id,
      UserId: selectedUserId
    },
    defaults: {
      ChannelId: channel.id,
      UserId: selectedUserId
    }
  });

  ctx.body = {
    id: channel.id,
    channelAlreadyExists,
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
                      where files.entity_id = :messageId`;
  return models.sequelize
    .query(filesQuery, {
      replacements: {
        messageId: message.id
      }
    })
    .then(function (messageFiles) {
      return messageFiles[0];
    });
}

router.get("/messages/search/:query", async (ctx, next) => {
  const userId = ctx.user.id;
  const { query } = ctx.params;
  const sqlQuery = `select users.avatar, users.name, messages.created_at, channels.id channelId, messages.id id, message from messages, channels, user_channels, users
                    where user_channels.channel_id = channels.id and user_channels.user_id = :userId
                    and messages.channel_id = channels.id and messages._search @@ to_tsquery(:query)
                    and messages.user_id = users.id`;

  const [messages] = await models.sequelize.query(sqlQuery, {
    replacements: { query: `${query} | ${query}:*`, userId }
  });

  ctx.body = messages.map(m => {
    return {
      id: m.id,
      createdAt: m.created_at,
      avatar: getUploadFilePath(m.avatar),
      message: m.message,
      userName: m.name,
      channelId: m.channelid
    };
  });
});

router.get("/messages/exact", async ctx => {
  const { channelId, messageId } = ctx.request.query;
  const userId = ctx.user.id;

  // for (let i = 1; i < 1000; i++) {
  //   await models.Message.create({
  //     channelId: 3,
  //     UserId: 1,
  //     message: `${i} ${faker.lorem.sentences(3)}`,
  //     type: "text"
  //   });
  // }

  const query = `select distinct messages.id, message, type, messages.user_id, name,
            avatar, messages.created_at, seen from messages 
            join users on (messages.user_id = users.id)
            left join reads on (reads.message_id = messages.id and reads.user_id=:userId) 
            where (messages.channel_id = :channelId) and messages.id >= :messageId
            order by messages.created_at
            limit 20`;

  const [messages] = await models.sequelize.query(query, {
    replacements: {
      userId,
      channelId,
      messageId
    }
  });
  ctx.body = await Promise.all(getFullMessages(messages));
});

router.get("/messages", async ctx => {
  const { channelId, lastMessageId, firstMessageId } = ctx.request.query;
  const userId = ctx.user.id;
  const limit = 20;
  let query;

  // Используем id последнего сообщения чтобы не посылать дублирующие записи
  // такая ситуация может возникнуть если загрузили первые сообщения, ввели новое сообщение
  // и потом снова подгрузили
  if (firstMessageId) {
    query = `select *from (select distinct messages.id, message, type, messages.user_id, name,
            avatar, messages.created_at, seen from messages 
            join users on (messages.user_id = users.id)
            left join reads on (reads.message_id = messages.id and reads.user_id=:userId) 
            where (messages.channel_id = :channelId) and (messages.id < :firstMessageId)
            order by created_at desc
            limit :limit) as t order by created_at`;
  } else if (lastMessageId) {
    query = `select distinct messages.id, message, type, messages.user_id, name,
            avatar, messages.created_at, seen from messages 
            join users on (messages.user_id = users.id)
            left join reads on (reads.message_id = messages.id and reads.user_id=:userId) 
            where (messages.channel_id = :channelId) and (messages.id > :lastMessageId)
            order by messages.created_at 
            limit :limit`;
  } else {
    query = `select distinct messages.id, message, type, messages.user_id, name,
            avatar, messages.created_at, seen from messages 
            join users on (messages.user_id = users.id)
            left join reads on (reads.message_id = messages.id and reads.user_id=:userId) 
            where (messages.channel_id = :channelId) 
            order by messages.created_at 
            limit :limit`;
  }

  const [messages] = await models.sequelize.query(query, {
    replacements: {
      userId,
      channelId,
      firstMessageId,
      lastMessageId,
      limit
    }
  });
  ctx.body = await Promise.all(getFullMessages(messages));
});

function getFullMessages(messages) {
  return messages.map(message => {
    return getMessageFiles(message).then(messageFiles => {
      return {
        id: message.id,
        message: message.message,
        type: message.type,
        userName: message.name,
        userId: message.user_id,
        avatar: getUploadFilePath(message.avatar),
        createdAt: message.created_at,
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
}

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
    createdAt: message.createdAt,
    channelId,
    files: createdFiles
  };
});

router.del("/userChannels/:channelId", async (ctx, next) => {
  const userId = ctx.user.id;
  const { channelId } = ctx.params;

  await models.UserChannel.destroy({
    where: {
      userId,
      channelId
    }
  });

  ctx.body = "ok";
});

// Добавление пользователей в чат
router.post("/userChannels/users", async ctx => {
  const { channelId, users } = ctx.request.body;

  const promises = users.map(async user => {
    let userChannel = await models.UserChannel.findOne({
      where: {
        ChannelId: channelId,
        UserId: user
      }
    });

    if (!userChannel) {
      userChannel = await models.UserChannel.create({
        ChannelId: channelId,
        UserId: user
      });
    }
    return userChannel;
  });

  await Promise.all(promises);

  const userChannels = await models.UserChannel.findAll({
    where: {
      ChannelId: channelId
    }
  });

  ctx.body = await getChannelUsers(channelId);
});

router.get("/userChannels/:id/users", async ctx => {
  const { id } = ctx.params;
  ctx.body = await getChannelUsers(id);
});

router.delete("/userChannels/:id/users", async ctx => {
  const { id } = ctx.params;
  const { users } = ctx.query;
  const userId = ctx.user.id;

  const channel = await models.Channel.findOne({
    where: {
      id
    }
  });

  if (channel.userId != userId) {
    ctx.status = 403;
    ctx.body = "Unauthorized!";
    return false;
  }


  await models.UserChannel.destroy({
    where: {
      channelId: id,
      userId: users.split(",")
    }
  });

  ctx.body = await getChannelUsers(id);
});

router.put("/userChannels/:id/avatar", koaBody({ multipart: true }), async ctx => {
  const { id } = ctx.params;
  const { file } = ctx.request.files;
  console.log(id, file)
  await models.Channel.update({
    avatar: file.name
  }, {
      where: {
        id
      },
    });
  await uploadFiles(file);
  ctx.body = {
    avatar: getUploadFilePath(file.name)
  };
});

async function getChannelUsers(channelId) {
  const query = `select users.id, name, avatar from users, user_channels
                where users.id = user_channels.user_id and user_channels.channel_id=:channelId`;

  const [users] = await models.sequelize.query(query, {
    replacements: { channelId }
  });

  return users.map(u => {
    return {
      id: u.id,
      name: u.name,
      avatar: getUploadFilePath(u.avatar)
    };
  });
}

module.exports = router;
