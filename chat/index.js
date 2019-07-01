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
    console.log("onConnection");

    const token = socket.handshake.query && socket.handshake.query.token;
    const tokenOnly = token && token.split(" ")[1];
    try {
      decoded = jwt.verify(tokenOnly, process.env.API_TOKEN);
    } catch (e) {
      socket.disconnect(true);
      return;
    }

    socket.on("disconnect", this.onDisconnect.bind(this));

    socket.on("join", rooms => {
      console.log("Joining", rooms);
      socket.join(rooms);
    });

    socket.on("foo", () => {
      console.log("foo");
      socket.emit("bar", "bar");
    });

    this.socket = socket;
    this.socket.on("channel-message", this.onChannelMessage.bind(this, {}));
    this.socket.on(
      "channel-file-message",
      this.onChannelFileMessage.bind(this, {})
    );
    this.socket.on("channel-message-mark", this.onMarkAsRead.bind(this));
    this.socket.on(
      "private-chat-created",
      this.onPrivateChatCreated.bind(this)
    );
    this.socket.on("channel-created", this.onChannelCreated.bind(this));
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
    console.log("Adding new chat", chat);
    this.io.emit("private-chat-created", chat);
  }

  onChannelCreated({ channel, usersIds }) {
    console.log("Channel-create", channel, usersIds);
    usersIds.forEach(userId => {
      this.io.emit("channel-created", { userId, channel });
    });
  }
}

module.exports = Chat;
