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
        models.User.findByPk(userId).then(user => {
          resolve({
            channelId,
            id: message.id,
            type: message.type,
            message: message.message,
            userName: user.name,
            avatar: getUploadFilePath(user.avatar),
            files: files.map(f => ({
              id: f.id,
              url: getUploadFilePath(f.file),
              name: f.file,
              size: f.size
            }))
          });
        });
      });
    });
  },
  combineFileMessage(channelId, userId, files = [], id) {
    return new Promise((resolve, reject) => {
      models.User.findByPk(userId).then(user => {
        resolve({
          channelId,
          id,
          type: "file",
          message: null,
          userName: user.name,
          avatar: getUploadFilePath(user.avatar),
          files: files.map(f => ({
            id: f.id,
            url: getUploadFilePath(f.file),
            name: f.file,
            size: f.size
          }))
        });
      });
    });
  }
};
