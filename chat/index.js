const util = require("./util");
const jwt = require("jsonwebtoken");
const models = require("../models");

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

    console.log("");
    console.log("");
    console.log("");
    console.log("onConnection");
    console.log(`with token ${tokenOnly && tokenOnly.slice(0, 10)}`);

    try {
      decoded = jwt.verify(tokenOnly, process.env.API_TOKEN);
      this.clients[userId] = socket;
      console.log(`User: ${userId} connected`);
      console.log(`Connected ${Object.keys(this.clients).length}`);
      console.log(`Sockets: ${Object.keys(this.clients)}`);
    } catch (e) {
      console.log(userId, "failed");
      socket.disconnect(true);
      return;
    }

    console.log("");
    console.log("");
    console.log("");

    socket.on("disconnect", this.onDisconnect.bind(this, socket));

    socket.on("join", rooms => {
      // console.log("Joining", rooms);
      socket.join(rooms);
    });

    socket.on("channel-message", this.onChannelMessage.bind(this, {}));
    socket.on("channel-file-message", this.onChannelFileMessage.bind(this, {}));
    socket.on("channel-message-mark", this.onMarkAsRead.bind(this));
    socket.on("private-chat-created", this.onPrivateChatCreated.bind(this));
    socket.on("channel-created", this.onChannelCreated.bind(this));
  }

  onDisconnect(socket) {
    const userId = socket.handshake.query && socket.handshake.query.userId;
    this.clients[userId] = socket;
    delete this.clients[userId];
    console.log(`Sockets: ${Object.keys(this.clients)}`);
    console.log(`after disconnected ${Object.keys(this.clients).length}`);
  }

  onChannelMessage(userName, m, fn) {
    const { channelId, message, type, userId, files } = m;
    console.log(channelId, message, type, userId, files);
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

    if (firstUserSocket) {
      firstUserSocket.emit("private-chat-created", chat);
    }
    if (secondUserSocket) {
      secondUserSocket.emit("private-chat-created", chat);
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
