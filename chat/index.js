const util = require("./util");
const jwt = require("jsonwebtoken");
const models = require("../models");

class Chat {
  constructor(io) {
    this.io = io;
    // this.io.use(this.verifyToken.bind(this));
    this.io.on("connection", this.onConnection.bind(this));
  }

  verifyToken(socket, next) {
    console.log(9999);
    const token = socket.handshake.query && socket.handshake.query.token;
    const tokenOnly = token && token.split(" ")[1];

    if (tokenOnly) {
      jwt.verify(tokenOnly, process.env.API_TOKEN, function(err, decoded) {
        if (err) return next(err);
        socket.decoded = decoded;
        next();
      });
    } else {
      console.log("ERR");
      next();
    }
  }

  onConnection(socket) {
    console.log("onConnection");
    let userName;
    let decoded;

    const token = socket.handshake.query && socket.handshake.query.token;
    const tokenOnly = token && token.split(" ")[1];
    console.log(tokenOnly, 999);
    try {
      decoded = jwt.verify(tokenOnly, process.env.API_TOKEN);
    } catch (e) {
      console.log("Err", e);
      socket.disconnect(true);
      return;
    }

    console.log("Settingup");
    socket.on("disconnect", this.onDisconnect.bind(this));

    socket.on("join", rooms => {
      console.log("Joining", rooms);
      socket.join(rooms);
    });

    this.socket = socket;
    this.socket.on("channel-message", this.onChannelMessage.bind(this, {}));
    this.socket.on(
      "channel-file-message",
      this.onChannelFileMessage.bind(this, {})
    );
    this.socket.on("channel-message-mark", this.onMarkAsRead.bind(this));
  }

  onDisconnect(socket) {
    console.log("Disconnect");
  }

  onChannelMessage(userName, m, fn) {
    const { channelId, message, type, userId, files } = m;
    util.writeMessage(channelId, message, type, userId, files).then(message => {
      this.io.to(channelId).emit("channel-message", message);
      fn();
    });
  }

  onChannelFileMessage(userName, m, fn) {
    const { channelId, message, type, userId, files, id } = m;
    util.combineFileMessage(channelId, userId, files, id).then(message => {
      this.io.to(channelId).emit("channel-message", message);
      fn();
    });
  }

  onMarkAsRead(m, fn) {
    const { userId, messageId } = m;

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
}

module.exports = Chat;
