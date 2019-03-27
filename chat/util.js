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
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    });
  }
};
