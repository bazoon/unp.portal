const util = require("./util");
const jwt = require("jsonwebtoken");
const models = require("../models");
const { error, log, warn } = require("../utils/log");


class Chat {
  constructor(io) {
    this.io = io;
    this.io.on("connection", this.onConnection.bind(this));
    this.clients = {};
  }

  verifyToken(socket, next) {
    const token = socket.handshake.query && socket.handshake.query.token;
    const tokenOnly = token && token.split(" ")[1];

    if (tokenOnly) {
      jwt.verify(tokenOnly, process.env.API_TOKEN, function(err, decoded) {
        if (err) return next(err);
        socket.decoded = decoded;
        next();
      });
    } else {
      next();
    }
  }

  onConnection(socket) {
    let userName;
    let decoded;

    this.socket = socket;
    const userId = socket.handshake.query && socket.handshake.query.userId;

    const token = socket.handshake.query && socket.handshake.query.token;
    const tokenOnly = token && token.split(" ")[1];
    log("OnConnection")
    try {
      decoded = jwt.verify(tokenOnly, process.env.API_TOKEN);
      log(`${userId} connected`);
      this.clients[userId] = socket;
    } catch (e) {
      log(userId, "failed", e);
      socket.disconnect(true);
      return;
    }

    socket.on("disconnect", this.onDisconnect.bind(this, socket));

    socket.on("join", rooms => {
      // log("Joining", rooms);
      socket.join(rooms);
    });

    socket.on("channel-message", this.onChannelMessage.bind(this, {}));
    socket.on("channel-file-message", this.onChannelFileMessage.bind(this, {}));
    socket.on("channel-message-mark", this.onMarkAsRead.bind(this));
    socket.on("private-chat-created", this.onPrivateChatCreated.bind(this));
    socket.on("channel-created", this.onChannelCreated.bind(this));
  }

  onDisconnect(socket) {  log()
    const userId = socket.handshake.query && socket.handshake.query.userId;
    this.clients[userId] = socket;
    delete this.clients[userId];
    error("Disconnected");
    log(`Sockets: ${Object.keys(this.clients)}`);
    log(`after disconnected ${Object.keys(this.clients).length}`);
  }

  onChannelMessage(userName, m, fn) {
    const { channelId, message, type, userId, files } = m;
    log(`Message ${message} sent: to channel ${channelId}, of type ${type} by user ${userId}, files: ${files}`);
    util.writeMessage(channelId, message, type, userId, files).then(message => {
      this.io.to(channelId).emit("channel-message", message);
      fn();
    });
  }

  onChannelFileMessage(userName, m, fn) {
    const { channelId, message, type, userId, files, id, createdAt } = m;
    util
      .combineFileMessage(channelId, userId, files, id, createdAt)
      .then(message => {
        this.io.to(channelId).emit("channel-message", message);
        // fn();
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

  onPrivateChatCreated(chat) {
    const { firstUser, secondUser } = chat;
    const firstUserSocket = this.clients[firstUser.id];
    const secondUserSocket = this.clients[secondUser.id];
    log("onPrivateChatCreated");
    if (firstUserSocket) {
      firstUserSocket.emit("private-chat-created", chat);
      log("sending to ", firstUser)
    }
    if (secondUserSocket) {
      secondUserSocket.emit("private-chat-created", chat);
      log("sending to ", secondUser)
    }
  }

  onChannelCreated({ channel, usersIds }) {
    usersIds.forEach(userId => {
      const socket = this.clients[userId];

      if (socket) {
        socket.emit("channel-created", { userId, channel });
      }
    });
  }

  sendMessage(messageName, message, userId) {
    const socket = this.clients[userId];
    return new Promise((resolve, reject) => {
      if (socket) {
        socket.emit(messageName, message);
        resolve();
      } else {
        reject();
      }
    });
  }
}

module.exports = Chat;
