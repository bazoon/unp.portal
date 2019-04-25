const fs = require("fs");
var path = require("path");
const fileName = path.resolve("routes/api/chat.json");
const models = require("../models");
const getUploadFilePath = require("../utils/getUploadFilePath");

module.exports = {
  writeMessage(channelId, message, type, userId, files = []) {
    return new Promise((resolve, reject) => {
      models.Message.create({
        message,
        type,
        ChannelId: channelId,
        UserId: userId
      }).then(message => {
        models.MessageFile.bulkCreate(
          files.map(f => {
            return {
              MessageId: message.id,
              FileId: f.id
            };
          })
        )
          .then(() => {
            models.User.findByPk(userId).then(user => {
              resolve({
                id: message.id,
                type: message.type,
                message: message.message,
                userName: user.name,
                avatar: getUploadFilePath(user.avatar),
                files: files.map(f => ({
                  id: f.id,
                  file: getUploadFilePath(f.file),
                  size: f.size
                }))
              });
            });
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  }
};
