import api from "./api";

export default {
  getAll() {
    return api.get("api/projectGroups/").then(({ data }) => {
      return data;
    });
  },
  create(payload) {
    return api.post("api/ProjectGroups/create", payload);
  },
  unsubscribe(groupId) {
    return api.post("api/ProjectGroups/unsubscribe", {
      groupId
    });
  },
  subscribe(groupId) {
    return api.post("api/ProjectGroups/subscribe", {
      groupId
    });
  },
  getBackgrounds() {
    return api.post("api/projectGroups/backgrounds").then(({ data }) => {
      return data;
    });
  },
  // Distinct group
  get(id) {
    return api.get("api/projectGroups/get", { id }).then(({ data }) => {
      return data;
    });
  },
  getConversation(id) {
    return api.get("api/conversations/get", { id }).then(({ data }) => data);
  },
  sendPost(payload) {
    return api.post("api/conversations/post", payload).then(({ data }) => {
      return data;
    });
  },
  pin(conversationId) {
    return api.post("api/projectGroups/conversation/pin", { conversationId });
  },
  unpin(conversationId) {
    return api.post("api/projectGroups/conversation/unpin", { conversationId });
  },
  updateBackground(payload) {
    return api
      .post("api/projectGroups/backgrounds/update", payload)
      .then(({ data }) => data);
  },
  updateGroupTitle(payload) {
    return api
      .post("api/projectGroups/update/title", payload)
      .then(({ data }) => data);
  },
  updateGroupShortDescription(payload) {
    return api
      .post("api/projectGroups/update/shortDescription", payload)
      .then(({ data }) => data);
  },
  makeAdmin(payload) {
    return api
      .post("api/projectGroups/participants/makeAdmin", payload)
      .then(({ data }) => data.id);
  },
  removeAdmin(payload) {
    return api
      .post("api/projectGroups/participants/removeAdmin", payload)
      .then(({ data }) => data.id);
  },
  removeFromGroup(payload) {
    return api
      .post("api/projectGroups/participants/remove", payload)
      .then(({ data }) => data.id);
  },
  approve(payload) {
    return api
      .post("api/projectGroups/participants/approve", payload)
      .then(({ data }) => data.id);
  },
  createConversation(payload) {
    return api
      .post("api/projectGroups/conversation/create", payload)
      .then(({ data }) => data);
  }
};
