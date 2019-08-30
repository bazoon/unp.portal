import { types, flow } from "mobx-state-tree";
import moment from "moment";
import socketIOClient from "socket.io-client";
import { notification } from "antd";
import api from "../api/chat";
import ChatChannel from "./models/ChatChannel";
import FoundChatMessage from "./models/FoundChatMessage";
import utils from "../utils";
import chatStates from '../components/Chat/states';


const ChatStore = types
  .model("ChatStore", {
    activeChannel: types.maybeNull(types.reference(ChatChannel)),
    channels: types.optional(types.array(ChatChannel), []),
    foundChannels: types.optional(
      types.array(types.reference(ChatChannel)),
      []
    ),
    currentMessage: types.maybeNull(types.optional(types.string, '')),
    foundMessages: types.optional(types.array(FoundChatMessage), []),
    isAddUsersWindowVisible: types.optional(types.boolean, false),
    chatState: types.optional(types.number, chatStates.chat)
  })
  .views(self => {
    const getActiveChannelName = function getActiveChannelName() {
      return self.activeChannel && self.activeChannel.name;
    };

    const getUnreadsCount = function getUnreadsCount() {
      return self.channels.reduce((acc, channel) => {
        return acc + channel.unreads;
      }, 0);
    };

    return {
      getActiveChannelName,
      getUnreadsCount
    };
  })
  .actions(self => {
    const socket = socketIOClient(location.host, {
      query: {
        token: `Bearer ${utils.getToken()}`,
        userName: localStorage.getItem("userName"),
        userId: localStorage.getItem("userId")
      }
    });

    function joinChannels(channels) {
      socket.emit("join", channels.map(channel => channel.id));
    }

    const afterCreate = function afterCreate() {
      socket.on("notify", message => {
        const { title, description, date } = message;
        const formattedDate = moment(date).format("DD.MM.YY HH:mm");

        notification.open({
          message: `Уведомление о ${title} дата ${formattedDate}`,
          description,
          duration: 0
        });
      });

      socket.on("channel-message", message => {

        if (self.currentUserStore.userId != message.userId) {
          notification.open({
            description: message.message,
            message: message.userName,
            duration: 2,
            onClick: () => self.setActiveChannel(message.channelId)
          });
        }


        const channel = self.channels.find(ch => ch.id === message.channelId);
        if (channel) {
          if (channel.messages.length === 0) {
            channel.loadMessages();
          } else {
            channel.addMessage(message);
          }
          channel.setLastMessage(message);
          channel.incUnreads();
        }
      });

      socket.on("private-chat-created", chat => {
        if (chat.channelAlreadyExists) {
          return;
        }

        const { userId } = self.currentUserStore;
        const { id, firstUser, secondUser } = chat;

        if (firstUser.id == userId || secondUser.id == userId) {
          const newChat = {
            id,
            avatar:
              firstUser.id == userId ? secondUser.avatar : firstUser.avatar,
            name: firstUser.id == userId ? secondUser.name : firstUser.name
          };

          self.addChannel(newChat);
          joinChannels(self.channels);
        }
      });

      socket.on("channel-created", ({ channel }) => {
        const { userId } = self.currentUserStore;
        const existingChannel = self.channels.find(ch => ch.id == channel.id);

        if (existingChannel) {
          existingChannel.setParticipants(channel.participants);
        } else {
          self.addChannel(channel);
          joinChannels(self.channels);
        }
      });

      socket.on("channel-updated", ({ channelId, participants, avatar }) => {
        const { userId } = self.currentUserStore
        const channel = self.channels.find(channel => channel.id == channelId);

        if (channel) {

          if (participants) {
            const participant = participants.find(p => p.id == userId);
            if (participant) {
              channel.setParticipants(participants);
            } else {
              self.removeChannel(channelId);
            }
          }

          if (avatar) {
            self.updateAvatar({ channelId, avatar });
          }


        }
      });

      socket.on("connect", () => {
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
      return Promise.all([
        self.activeChannel.loadMessages(),
        self.activeChannel.loadParticipants()
      ]);
    };


    const openChannelAtMessage = function openChannelAtMessage(
      channelId,
      messageId
    ) {
      self.activeChannel = channelId;
      return self.activeChannel.findMessages(messageId);
    };

    const addChannel = function addChannel(channel) {
      self.channels.push(channel);
    };

    const removeChannel = function removeChannel(channelId) {
      if (self.activeChannel && self.activeChannel.id == channelId) {
        self.activeChannel = null;
      }
      self.channels = self.channels.filter(ch => ch.id != channelId);
    };

    const updateAvatar = function updateAvatar({ channelId, avatar }) {
      const channel = self.channels.find(ch => ch.id == channelId);
      if (channel) {
        channel.updateAvatar(avatar);
      }
    }

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
        createdAt: data.createdAt,
        type: "file",
        id: data.id
      });
    });

    const createPrivateChat = flow(function* createPrivateChat(selectedUserId) {
      const chat = yield api.createPrivateChannel({ selectedUserId });
      socket.emit("private-chat-created", chat);
    });

    const createChannel = flow(function* createChannel(payload) {
      const data = yield api.createChannel(payload);
      socket.emit("channel-created", data);
    });

    const connectSocket = function connectSocket() {
      const token = `Bearer ${utils.getToken()}`;
      const userName = localStorage.getItem("userName");
      const userId = localStorage.getItem("userId");
      socket.query.token = token;
      socket.query.userName = userName;
      socket.query.userId = userId;
      if (token && !socket.connected) {
        socket.connect();
      }
    };

    const disconnectSocket = function disconnectSocket() {
      socket.disconnect(true);
    };

    const setCurrentUserStore = function setCurrentUserStore(currentUserStore) {
      self.currentUserStore = currentUserStore;
    };

    const markAsRead = flow(function* markAsRead(payload) {
      yield api.markAsRead(payload);
      if (self.activeChannel.unreads > 0) {
        self.activeChannel.decUnreads();
      }
    });

    const searchChannels = flow(function* searchChannels(value) {
      if (!value) return self.getChannels();
      self.activeChannel = undefined;
      const channels = yield api.searchChannels(value);
      if (channels) {
        self.foundChannels = channels;
      }
    });

    const searchMessages = flow(function* searchMessages(value) {
      if (!value) return;
      const messages = yield api.searchMessages(value);
      if (messages) {
        self.foundMessages = messages;
      }
    });

    const leaveChannel = flow(function* leaveChannel(payload) {
      yield api.leaveChannel(payload);
      self.activeChannel = null;
      self.channels = self.channels.filter(channel => channel.id != payload.id);
    });

    const addUsersToChannel = flow(function* addUsersToChannel(payload) {
      const users = yield api.addUsersToChannel({
        channelId: self.activeChannel.id,
        users: payload.users
      });

      self.activeChannel.setParticipants(users);

      socket.emit("channel-created", {
        channel: {
          id: self.activeChannel.id,
          name: self.activeChannel.name,
          avatar: self.activeChannel.avatar,
          participants: self.activeChannel.participants,
          lastMessage: self.activeChannel.lastMessage,
          isPrivate: self.activeChannel.private
        }
      });

    });

    const removeUsersFromChannel = flow(function* removeUsersFromChannel({ users }) {
      const toUsers = self.activeChannel.participants.map(p => p.id);
      yield self.activeChannel.removeParticipants(users);

      socket.emit("channel-updated", {
        channelId: self.activeChannel.id,
        participants: self.activeChannel.participants,
        toUsers
      });
    });

    const updateChannelAvatar = flow(function* updateChannelAvatar({ id, payload }) {
      const { avatar } = yield api.updateChannelAvatar({ id, payload });
      socket.emit("channel-updated", {
        channelId: self.activeChannel.id,
        avatar,
        toUsers: self.activeChannel.participants.map(p => p.id)
      });
    });

    const showAddUsersWindow = function showAddUsersWindow() {
      self.isAddUsersWindowVisible = true;
    };

    const hideAddUsersWindow = function hideAddUsersWindow() {
      self.isAddUsersWindowVisible = false;
    };

    const switchToChat = function switchToChat() {
      self.chatState = chatStates.chat;
    };

    const switchToCreate = function switchToCreate() {
      self.chatState = chatStates.create;
    };

    const switchToPrivate = function switchToPrivate() {
      self.chatState = chatStates.private;
    };

    const switchToSearch = function switchToSearch() {
      self.chatState = chatStates.search;
    };

    const switchToAdmin = function switchToAdmin() {
      self.chatState = chatStates.admin;
    };


    return {
      addChannel,
      removeChannel,
      createChannel,
      afterCreate,
      getChannels,
      setActiveChannel,
      openChannelAtMessage,
      setCurrentMessage,
      sendChatMessage,
      sendChatFiles,
      createPrivateChat,
      connectSocket,
      setCurrentUserStore,
      markAsRead,
      disconnectSocket,
      searchChannels,
      searchMessages,
      leaveChannel,
      addUsersToChannel,
      removeUsersFromChannel,
      updateChannelAvatar,
      updateAvatar,
      showAddUsersWindow,
      hideAddUsersWindow,
      switchToChat,
      switchToCreate,
      switchToPrivate,
      switchToSearch,
      switchToAdmin
    };
  });

export default ChatStore;
