import { observable } from "mobx";
import api from "../api/projectGroups";
import Group from "../models/Group";

class ProjectGroupsStore {
  @observable currentGroup = { participants: [], conversations: [], files: [] };

  @observable groups = [];

  @observable backgrounds = [];

  constructor(groupsApi) {
    this.api = groupsApi;
  }

  getGroups() {
    return this.groups;
  }

  getAll() {
    this.api.getAll().then(data => {
      this.groups = data.map(item => new Group(item));
    });
  }

  getCurrent(id) {
    return this.api.get(id).then(data => {
      const group = this.groups.find(g => g.id === id);
      if (group) {
        Object.assign(group, data);
        this.currentGroup = group;
      } else {
        this.currentGroup = new Group(data, api);
      }
    });
  }

  create(payload) {
    return this.api.create(payload).then(() => this.getAll());
  }

  subscribe(groupId) {
    return this.api.subscribe(groupId).then(() => {
      const group = this.groups.find(g => g.id === groupId);
      group.participant = true;
      group.participantsCount = +group.participantsCount + 1;
    });
  }

  unsubscribe(groupId) {
    return this.api.unsubscribe(groupId).then(() => {
      const group = this.groups.find(g => g.id === groupId);
      group.participant = false;
      group.participantsCount = +group.participantsCount - 1;
    });
  }

  subscribeToCurrent(groupId) {
    this.api.subscribe(groupId).then(() => {
      const group = this.groups.find(g => g.id == groupId);
      if (group) {
        group.participant = true;
        group.participantsCount = +group.participantsCount + 1;
      }
      this.currentGroup.participant = true;
      this.currentGroup.participantsCount =
        +this.currentGroup.participantsCount + 1;
    });
  }

  unsubscribeFromCurrent(groupId) {
    return this.api.unsubscribe(groupId).then(() => {
      const group = this.groups.find(g => g.id == groupId);
      if (group) {
        group.participant = false;
        group.participantsCount = +group.participantsCount - 1;
      }
      this.currentGroup.participant = false;
      this.currentGroup.participantsCount =
        +this.currentGroup.participantsCount - 1;
    });
  }

  getBackgrounds() {
    return this.api.getBackgrounds().then(data => {
      this.backgrounds = data;
    });
  }

  pin(conversationId) {
    this.api.pin(conversationId).then(() => {
      const conversation = this.currentGroup.conversations.find(
        c => c.id == conversationId
      );
      conversation.isPinned = true;
    });
  }

  unpin(conversationId) {
    this.api.unpin(conversationId).then(() => {
      const conversation = this.currentGroup.conversations.find(
        c => c.id == conversationId
      );
      conversation.isPinned = false;
    });
  }
}

export default new ProjectGroupsStore(api);
