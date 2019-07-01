import api from "./api";

export default {
  getChannels(userId) {
    return api.get("api/chat/channels", { userId }).then(({ data }) => {
      return data;
    });
  },
  joinChannel(payload) {
    return api.post("api/chat/channels/join", payload).then(({ data }) => {
      return data;
    });
  },
  createPrivateChannel(payload) {
    return api
      .post("api/chat/channels/createPrivate", payload)
      .then(({ data }) => {
        return data;
      });
  },
  createChannel(payload) {
    return api.post("api/chat/channels", payload).then(({ data }) => {
      return data;
    });
  },
  getChannellMessages({ channelId, currentPage }) {
    return api
      .get("api/chat/messages", { channelId, currentPage })
      .then(({ data }) => {
        return data;
      });
  },
  getMoreMessages({ channelId, currentPage, lastMessageId }) {
    return api
      .get("api/chat/messages", {
        channelId,
        currentPage,
        lastMessageId
      })
      .then(({ data }) => {
        return data;
      });
  },
  sendChatFiles(payload) {
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    return api.post("api/chat/upload", payload, config).then(({ data }) => {
      return data;
    });
  },
  markAsRead(payload) {
    return api.post("api/chat/seen", payload).then(({ data }) => {
      return data;
    });
  }
};
