import { types, flow } from "mobx-state-tree";
import api from "../api/chat";
import ChatChannel from "./models/ChatChannel";
import socketIOClient from "socket.io-client";

const ChatStore = types
  .model("ChatStore", {
    activeChannel: types.maybeNull(types.reference(ChatChannel)),
    channels: types.optional(types.array(ChatChannel), []),
    currentMessage: types.maybeNull(types.string)
  })
  .views(self => {
    const getActiveChannelName = function() {
      return self.activeChannel && self.activeChannel.name;
    };

    return {
      getActiveChannelName
    };
  })
  .actions(self => {
    const socket = socketIOClient(location.host, {
      query: {
        token: `Bearer ${localStorage.getItem("token")}`,
        userName: localStorage.getItem("userName")
      }
    });
    window.s = socket;

    function joinChannels(channels) {
      socket.emit("join", channels.map(channel => channel.id));
    }

    const afterCreate = function afterCreate() {
      socket.on("channel-message", message => {
        const channel = self.channels.find(ch => ch.id === message.channelId);
        if (channel) {
          if (channel.messages.length === 0) {
            channel.loadMessages();
          } else {
            channel.addMessage(message);
          }
          channel.setLastMessage(message.message);
        }
      });

      socket.on("private-chat-created", ({ chat, userId, selectedUserId }) => {
        console.log(userId, selectedUserId, chat);

        if (
          chat.firstUserId == userId ||
          chat.firstUserId == selectedUserId ||
          chat.secondUserId == userId ||
          chat.secondUserId == selectedUserId
        ) {
          self.addChannel(chat);
          joinChannels(self.channels);
        }
      });

      socket.on("connect", () => {
        console.log("Connecting....");
        if (self.channels && self.channels.length > 0) {
          joinChannels(self.channels);
        }
      });
    };

    const getChannels = flow(function* getChannels(userId) {
      const channels = yield api.getChannels(userId);

      if (channels) {
        self.channels = channels;
        joinChannels(channels);
      }
    });

    const setActiveChannel = function setActiveChannel(channelId) {
      self.activeChannel = channelId;
      self.activeChannel.loadMessages();
    };

    const addChannel = function addChannel(channel) {
      self.channels.push(channel);
    };

    const setCurrentMessage = function setCurrentMessage(value) {
      self.currentMessage = value;
    };

    const sendChatMessage = function sendChatMessage(payload) {
      socket.emit("channel-message", payload, () => {
        self.setCurrentMessage("");
      });
    };

    const sendChatFiles = flow(function* sendChatFiles(userId, payload) {
      const data = yield self.activeChannel.sendChatFiles(payload);
      socket.emit("channel-file-message", {
        channelId: self.activeChannel.id,
        userId,
        message: "",
        files: data.files,
        type: "file",
        id: data.id
      });
    });

    const createPrivateChat = flow(function* createPrivateChat(
      userId,
      selectedUserId
    ) {
      const chat = yield api.createPrivateChannel({ selectedUserId });
      socket.emit("private-chat-created", {
        chat,
        userId,
        selectedUserId
      });
    });

    const connectSocket = function() {
      const token = `Bearer ${localStorage.getItem("token")}`;
      socket.query.token = token;
      console.log("connecting with", token);
      socket.connect();
    };

    return {
      addChannel,
      afterCreate,
      getChannels,
      setActiveChannel,
      setCurrentMessage,
      sendChatMessage,
      sendChatFiles,
      createPrivateChat,
      connectSocket
    };
  });

export default ChatStore;
