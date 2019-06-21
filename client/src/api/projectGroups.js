import api from "./api";

export default {
  getAll(payload) {
    return api.get("api/projectGroups", payload).then(({ data }) => {
      return data;
    });
  },
  create(payload) {
    return api.post("api/ProjectGroups", payload);
  },
  unsubscribe(groupId) {
    return api
      .delete(`api/ProjectGroups/${groupId}/subscriptions`)
      .then(({ data }) => data);
  },
  subscribe(groupId) {
    return api.post(`api/ProjectGroups/${groupId}/subscriptions`);
  },
  getBackgrounds() {
    return api.get("api/projectGroups/backgrounds").then(({ data }) => {
      return data;
    });
  },
  // Distinct group
  get(id) {
    return api.get(`api/projectGroups/${id}`).then(({ data }) => {
      return data;
    });
  },
  getConversation(id) {
    return api.get(`api/conversations/${id}`).then(({ data }) => data);
  },
  sendPost(payload) {
    return api.post("api/conversations/posts", payload).then(({ data }) => {
      return data;
    });
  },
  pin(conversationId) {
    return api.post("api/projectGroups/conversations/pins", { conversationId });
  },
  unpin(conversationId) {
    return api.delete("api/projectGroups/conversations/pins", {
      conversationId
    });
  },
  updateBackground(payload) {
    return api
      .put("api/projectGroups/backgrounds", payload)
      .then(({ data }) => data);
  },
  updateGroupTitle(payload) {
    return api
      .put(`api/projectGroups/${payload.groupId}/title`, payload)
      .then(({ data }) => data);
  },
  updateGroupShortDescription(payload) {
    return api
      .put(`api/projectGroups/${payload.groupId}/shortDescription`, payload)
      .then(({ data }) => data);
  },
  makeAdmin(payload) {
    return api
      .post("api/projectGroups/admins", payload)
      .then(({ data }) => data.id);
  },
  removeAdmin(payload) {
    return api
      .delete("api/projectGroups/admins", payload)
      .then(({ data }) => data.id);
  },
  removeFromGroup(payload) {
    return api
      .delete("api/projectGroups/participants", payload)
      .then(({ data }) => data.id);
  },
  approve(payload) {
    return api
      .post("api/projectGroups/requests", payload)
      .then(({ data }) => data.id);
  },
  createConversation(payload) {
    return api
      .post(`api/projectGroups/conversations`, payload)
      .then(({ data }) => data);
  },
  getUserGroups() {
    return api.get("api/projectGroups/userGroups").then(({ data }) => {
      return data;
    });
  },
  getAdminUserGroups(payload) {
    return api.get("admin/api/projectGroups/user", payload).then(({ data }) => {
      return data;
    });
  },
  deleteGroup(id) {
    return api.delete(`api/projectGroups/${id}`);
  }
};
