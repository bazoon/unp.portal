import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const projectGroups = State({
  initial: { groups: [], backgrounds: [] },
  setProjectGroups(state, payload) {
    return { ...state, groups: payload };
  },
  addProjectGroup(state, { createGroup }) {
    const { groups } = state;
    return { ...state, groups: [...groups, createGroup] };
  },
  unsubscribeProjectGroup(state, { groupId }) {
    const { groups } = state;
    const group = groups.find(g => g.id === groupId);
    group.participant = false;
    group.participantsCount = +group.participantsCount - 1;
    return { ...state, groups: [...groups] };
  },
  subscribeProjectGroup(state, { groupId }) {
    const { groups } = state;
    const group = groups.find(g => g.id === groupId);
    group.participant = true;
    group.participantsCount = +group.participantsCount + 1;
    return { ...state, groups: [...groups] };
  },
  setProjectGroupsBackgrounds(state, { data }) {
    return { ...state, backgrounds: [...data] };
  }
});

Effect("getProjectGroups", ({ type, userId }) => {
  const urls = {
    my: "api/projectGroups/list/my",
    created: "api/projectGroups/list/created",
    all: "api/projectGroups/list"
  };

  api.get(urls[type], { userId }).then(response => {
    Actions.setProjectGroups(response.data);
  });
});

Effect("postCreateGroup", ({ payload, userId }) => {
  api.post("api/ProjectGroups/create", payload).then(response => {
    Actions.getProjectGroups({ type: "all", userId });
  });
  // client
  //   .mutate({
  //     mutation: CreateGroupMutation,
  //     variables: { input: payload }
  //   })
  //   .then(({ data }) => {
  //     Actions.addProjectGroup(data);
  //   });
});

Effect("postUnsubscribeProjectGroup", ({ groupId, userId }) => {
  api
    .post("api/ProjectGroups/unsubscribe", {
      groupId,
      userId
    })
    .then(() => {
      Actions.unsubscribeProjectGroup({ groupId });
    });
});

Effect("postSubscribeProjectGroup", ({ groupId, userId }) => {
  api
    .post("api/ProjectGroups/subscribe", {
      groupId,
      userId
    })
    .then(() => {
      Actions.subscribeProjectGroup({ groupId });
    });
});

Effect("getProjectGroupsBackgrounds", () => {
  api.post("api/projectGroups/backgrounds").then(data => {
    Actions.setProjectGroupsBackgrounds(data);
  });
});

export default projectGroups;
