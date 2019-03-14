const util = require("./util");

class Chat {
  constructor(io) {
    this.io = io;
    this.io.on("connection", this.onConnection.bind(this));
  }

  onConnection(socket) {
    console.log("Connected");
    this.socket = socket;
    this.socket.on("channel-message", this.onChannelMessage.bind(this));
  }

  onChannelMessage(m, fn) {
    const { channelId, message, type } = m;
    util.writeMessage(channelId, message, type).then(() => fn());
    this.io.emit("channel-message", m);
  }
}

module.exports = Chat;
