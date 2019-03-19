const util = require("./util");
const secret = "Some secret key";
const jwt = require("jsonwebtoken");

class Chat {
  constructor(io) {
    this.io = io;
    // this.io.use(this.verifyToken.bind(this));
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
    console.log("Connected");

    socket.on("disconnect", this.onDisconnect.bind(this));
    this.socket = socket;

    this.socket.on("channel-message", this.onChannelMessage.bind(this));
    this.socket.on("notify-upload", this.onNotifyUpload.bind(this));
  }

  onDisconnect(socket) {
    console.log("disconnect");
  }

  onChannelMessage(m, fn) {
    const { channelId, message, type } = m;
    util.writeMessage(channelId, message, type).then(() => fn());
    this.io.emit("channel-message", m);
  }

  onNotifyUpload() {
    this.io.emit("channel-reload");
  }
}

module.exports = Chat;
