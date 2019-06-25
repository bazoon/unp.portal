import { types, flow } from "mobx-state-tree";
import ChatMessage from "./ChatMessage";
import api from "../../api/chat";

const ChatChannel = types
  .model("ChatChannel", {
    id: types.identifierNumber,
    name: types.string,
    avatar: types.maybeNull(types.string),
    messages: types.array(ChatMessage),
    page: types.optional(types.integer, 1),
    lastMessage: types.maybeNull(types.string),
    lastMessageId: types.maybeNull(types.integer),
    hasMoreMessages: types.optional(types.maybeNull(types.boolean), true)
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
        }
      }
    });

    const loadMoreMessages = flow(function* loadMoreMessages() {
      self.page += 1;

      const messages = yield api.getMoreMessages({
        channelId: self.id,
        currentPage: self.page,
        lastMessageId: self.lastMessageId
      });

      if (messages) {
        self.messages = messages.concat(self.messages);

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

    return {
      loadMessages,
      addMessage,
      loadMoreMessages,
      sendChatFiles,
      setLastMessage
    };
  });

export default ChatChannel;
