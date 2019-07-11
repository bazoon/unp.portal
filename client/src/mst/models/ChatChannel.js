import { types, flow } from "mobx-state-tree";
import ChatMessage from "./ChatMessage";
import api from "../../api/chat";

const ChatChannel = types
  .model("ChatChannel", {
    id: types.identifierNumber,
    name: types.maybeNull(types.string),
    private: types.maybeNull(types.boolean),
    avatar: types.maybeNull(types.string),
    messages: types.array(ChatMessage),
    page: types.optional(types.integer, 1),
    // userName: types.maybeNull(types.string),
    // lastMessage: types.maybeNull(types.string),
    // lastMessageId: types.maybeNull(types.integer),
    hasMoreMessages: types.optional(types.maybeNull(types.boolean), true),
    lastMessage: types.maybeNull(ChatMessage),
    unreads: types.optional(types.integer, 0),
    participantsCount: types.optional(types.integer, 2)
  })
  .actions(self => {
    const loadMessages = flow(function* loadMessages() {
      if (self.messages.length === 0) {
        const messages = yield api.getChannellMessages({
          channelId: self.id,
          currentPage: self.page
        });

        if (messages) {
          self.messages = messages;
          const lastMessage = messages && messages[messages.length - 1];
          self.lastMessageId = lastMessage && lastMessage.id;
          self.hasMoreMessages = true;
          self.firstMessageId = messages && messages[0] && messages[0].id;
        }
      }
    });

    const findMessages = flow(function* findMessages(messageId) {
      const messages = yield api.findChannelMessages({
        channelId: self.id,
        messageId
      });

      if (messages) {
        self.messages = messages;
        const lastMessage = messages && messages[messages.length - 1];
        self.lastMessageId = lastMessage && lastMessage.id;
        self.hasMoreMessages = true;
        self.firstMessageId = messages && messages[0] && messages[0].id;
      }
    });

    const loadMoreMessages = flow(function* loadMoreMessages() {
      self.page += 1;

      if (self.isLoading) return;

      self.isLoading = true;
      const messages = yield api.getMoreMessages({
        channelId: self.id,
        currentPage: self.page,
        lastMessageId: self.firstMessageId
      });
      self.isLoading = false;

      if (messages) {
        self.messages = messages.concat(self.messages);
        self.firstMessageId = messages && messages[0] && messages[0].id;

        if (messages.length > 0) {
          self.hasMoreMessages = true;
        } else {
          self.hasMoreMessages = false;
        }
      }
    });

    const sendChatFiles = flow(function* sendChatFiles(payload) {
      return yield api.sendChatFiles(payload);
    });

    const addMessage = function addMessage(message) {
      self.messages.push(message);
    };

    const setLastMessage = function setLastMessage(message) {
      self.lastMessage = message;
    };

    const incUnreads = function incUnreads(message) {
      self.unreads += 1;
    };

    const decUnreads = function decUnreads(message) {
      self.unreads -= 1;
    };

    return {
      loadMessages,
      findMessages,
      addMessage,
      loadMoreMessages,
      sendChatFiles,
      setLastMessage,
      incUnreads,
      decUnreads
    };
  });

export default ChatChannel;
