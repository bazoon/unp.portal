const util = require("./util");
const secret = "Some secret key";
const jwt = require("jsonwebtoken");
const models = require("../models");

class Chat {
  constructor(io) {
    this.io = io;
    this.io.use(this.verifyToken.bind(this));
    this.io.on("connection", this.onConnection.bind(this));
  }

  verifyToken(socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, secret, function(err, decoded) {
        if (err) return next(err);
        socket.decoded = decoded;
        next();
      });
    } else {
      next(new Error("Authentication error"));
    }
  }

  onConnection(socket) {
    // console.log("Connected", socket.decoded);
    const { userName } = socket.decoded;
    socket.on("disconnect", this.onDisconnect.bind(this));
    this.socket = socket;
    this.socket.on("channel-message", this.onChannelMessage.bind(this, {}));

    this.socket.on("channel-message-mark", this.onMarkAsRead.bind(this));

    this.socket.on("notify-upload", this.onNotifyUpload.bind(this, userName));
  }

  onDisconnect(socket) {
    // console.log("disconnect");
  }

  onChannelMessage(userName, m, fn) {
    const { channelId, message, type, userId, files } = m;
    console.log(1111, m);

    util.writeMessage(channelId, message, type, userId, files).then(message => {
      this.io.emit("channel-message", message);
      fn();
    });
  }

  onMarkAsRead(m, fn) {
    const { userId, messageId } = m;
    console.log(userId, messageId);

    models.Read.findOne({
      where: {
        UserId: userId,
        MessageId: messageId
      }
    }).then(function(found) {
      if (!found) {
        models.Read.create({
          UserId: userId,
          MessageId: messageId,
          seen: true
        });
      }
    });
  }

  onNotifyUpload() {
    console.log("UUUUUU");
    // this.io.emit("channel-reload");
  }
}

module.exports = Chat;
