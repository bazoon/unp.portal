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

      socket.on("private-chat-created", chat => {
        const { userId } = self.currentUserStore;
        const { id, firstUser, secondUser } = chat;
        if (firstUser.id == userId || secondUser.id == userId) {
          const newChat = {
            id: id,
            avatar:
              firstUser.id == userId ? secondUser.avatar : firstUser.avatar,
            name: firstUser.id == userId ? secondUser.name : firstUser.name
          };
          self.addChannel(newChat);
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

    const createPrivateChat = flow(function* createPrivateChat(selectedUserId) {
      const chat = yield api.createPrivateChannel({ selectedUserId });
      socket.emit("private-chat-created", chat);
    });

    const connectSocket = function() {
      const token = `Bearer ${localStorage.getItem("token")}`;
      socket.query.token = token;
      console.log("connecting with", token);
      socket.connect();
    };

    const setCurrentUserStore = function setCurrentUserStore(currentUserStore) {
      self.currentUserStore = currentUserStore;
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
      connectSocket,
      setCurrentUserStore
    };
  });

export default ChatStore;
