const fs = require("fs");
var path = require("path");
const fileName = path.resolve("routes/api/chat.json");
const models = require("../models");

module.exports = {
  writeMessage(channelId, message, type, userId) {
    return new Promise((resolve, reject) => {
      models.Message.create({
        message,
        type,
        ChannelId: channelId,
        UserId: userId
      })
        .then(message => {
          models.User.findByPk(userId).then(user => {
            resolve({
              id: message.id,
              type: message.type,
              message: message.message,
              userName: user.name,
              avatar: user.avatar
            });
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }
};
