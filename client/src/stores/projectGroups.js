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
      window.groups = this.groups;
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
      group.isMember = group.isOpen;
      group.participantsCount = +group.participantsCount + 1;
    });
  }

  unsubscribe(groupId) {
    return this.api.unsubscribe(groupId).then(() => {
      const group = this.groups.find(g => g.id === groupId);
      group.participant = false;
      group.isMember = group.isOpen;
      group.participantsCount = +group.participantsCount - 1;
    });
  }

  subscribeToCurrent(groupId) {
    this.api.subscribe(groupId).then(() => {
      return this.api.get(groupId).then(data => {
        const group = this.groups.find(g => g.id == groupId);
        if (group) {
          group.participant = true;
          group.participants = data.participants;
          group.isMember = group.isOpen;
          group.participantsCount = data.participants.length;
          this.currentGroup.participant = true;
          this.currentGroup.isMember = this.currentGroup.isOpen;
          this.currentGroup.participants = data.participants;
        } else {
          this.currentGroup.participant = true;
          this.currentGroup.participants = data.participants;
          this.currentGroup.isMember = this.currentGroup.isOpen;
        }
      });
    });
  }

  unsubscribeFromCurrent(groupId) {
    return this.api.unsubscribe(groupId).then(() => {
      return this.api.get(groupId).then(data => {
        debugger;
        const group = this.groups.find(g => g.id == groupId);
        if (group) {
          group.participant = false;
          group.participants = data.participants;
          group.isMember = undefined;
          group.participantsCount = data.participants.length;
          this.currentGroup.participant = false;
          this.currentGroup.isMember = undefined;
          this.currentGroup.participants = data.participants;
        } else {
          this.currentGroup.participant = false;
          this.currentGroup.isMember = undefined;
          this.currentGroup.participants = data.participants;
        }
      });
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

  updateBackground(payload) {
    return this.api.updateBackground(payload).then(({ avatar }) => {
      this.currentGroup.avatar = avatar;
    });
  }

  updateGroupTitle(payload) {
    this.api.updateGroupTitle(payload).then(() => {
      this.currentGroup.title = payload.title;
    });
  }

  updateGroupShortDescription(payload) {
    return this.api.updateGroupShortDescription(payload).then(() => {
      this.currentGroup.shortDescription = payload.shortDescription;
    });
  }

  makeAdmin(payload) {
    return this.api.makeAdmin(payload).then(() => {
      const participants = this.currentGroup.participants.map(p => {
        if (p.id == payload.id) {
          p.isAdmin = true;
          return p.clone();
        }
        return p;
      });

      this.currentGroup.participants = participants;
    });
  }

  removeAdmin(payload) {
    return this.api.makeAdmin(payload).then(() => {
      const participants = this.currentGroup.participants.map(p => {
        if (p.id == payload.id) {
          p.isAdmin = false;
          return p.clone();
        }
        return p;
      });

      this.currentGroup.participants = participants;
    });
  }

  approve(payload) {
    return this.api.approve(payload).then(() => {
      const participants = this.currentGroup.participants.map(p => {
        if (p.id == payload.id) {
          p.isMember = true;
          return p.clone();
        }
        return p;
      });

      this.currentGroup.participants = participants;
    });
  }

  removeFromGroup(payload) {
    return this.removeFromGroup(payload).then(() => {});
  }

  createConversation(payload) {
    return this.api.createConversation(payload).then(data => {
      this.currentGroup.conversations.push(data);
    });
  }
}

export default new ProjectGroupsStore(api);
