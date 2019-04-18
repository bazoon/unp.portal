import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const projectGroups = State({
  initial: { groups: [] },
  setProjectGroups(state, payload) {
    return { ...state, groups: payload };
  },
  unsubscribeProjectGroup(state, { groupId }) {
    const { groups } = state;
    const group = groups.find(g => g.id === groupId);
    group.participant = false;
    group.count -= 1;
    return { ...state, groups: [...groups] };
  },
  subscribeProjectGroup(state, { groupId }) {
    const { groups } = state;
    const group = groups.find(g => g.id === groupId);
    group.participant = true;
    group.count += 1;
    return { ...state, groups: [...groups] };
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

export default projectGroups;
