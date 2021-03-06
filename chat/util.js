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
            createdAt: message.createdAt,
            type: message.type,
            message: message.message,
            userName: user.name,
            userId: user.id,
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
  combineFileMessage(channelId, userId, files = [], id, createdAt) {
    return new Promise((resolve, reject) => {
      models.User.findByPk(userId).then(user => {
        resolve({
          channelId,
          id,
          createdAt,
          type: "file",
          message: null,
          userName: user.name,
          userId,
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
