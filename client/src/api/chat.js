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
  findChannelMessages({ channelId, messageId }) {
    return api
      .get("api/chat/messages/exact", { channelId, messageId })
      .then(({ data }) => {
        return data;
      });
  },
  getMoreMessages({ channelId, lastMessageId, firstMessageId }) {
    return api
      .get("api/chat/messages", {
        channelId,
        firstMessageId,
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
  },
  searchChannels(query) {
    return api
      .get(`api/chat/channels/search/${query}`)
      .then(({ data }) => data);
  },
  searchMessages(query) {
    return api
      .get(`api/chat/messages/search/${query}`)
      .then(({ data }) => data);
  },
  leaveChannel({ id }) {
    return api.delete(`api/chat/userChannels/${id}`).then(({ data }) => data);
  },
  addUsersToChannel(payload) {
    return api
      .post(`api/chat/userChannels/users`, payload)
      .then(({ data }) => data);
  },
  loadParticipants(id) {
    return api
      .get(`api/chat/userChannels/${id}/users`)
      .then(({ data }) => data);
  },
  removeUsersFromChannel(payload) {
    return api
      .delete(`api/chat/userChannels/${payload.channelId}/users`, { users: payload.users.join(",") })
      .then(({ data }) => data);
  }

};
