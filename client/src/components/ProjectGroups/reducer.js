import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import client from "../client";
import {
  GroupsQuery,
  SubscribeMutation,
  UnsubscribeMutation,
  CreateGroupMutation
} from "./queries";

const projectGroups = State({
  initial: { groups: [] },
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
  client
    .query({
      query: GroupsQuery
    })
    .then(({ data }) => {
      Actions.setProjectGroups(data.projectGroups);
    });
});

Effect("postCreateGroup", ({ payload, userId }) => {
  client
    .mutate({
      mutation: CreateGroupMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {
      Actions.addProjectGroup(data);
    });
});

Effect("postUnsubscribeProjectGroup", ({ groupId, userId }) => {
  client
    .mutate({
      mutation: UnsubscribeMutation,
      variables: { groupId }
    })
    .then(({ data }) => {
      Actions.unsubscribeProjectGroup({ groupId });
    });
});

Effect("postSubscribeProjectGroup", ({ groupId, userId }) => {
  client
    .mutate({
      mutation: SubscribeMutation,
      variables: { groupId }
    })
    .then(({ data }) => {
      Actions.subscribeProjectGroup({ groupId });
    });
});

export default projectGroups;
