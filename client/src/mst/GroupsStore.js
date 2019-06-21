import {
  types,
  onSnapshot,
  flow,
  applySnapshot,
  getSnapshot,
  clone
} from "mobx-state-tree";
import { notification } from "antd";
import Group from "./models/Group";
import api from "../api/projectGroups";
import Background from "./models/Background";
import Participant from "./models/Participant";
import Conversation from "./models/Conversation";
import findInTree from "../utils/findPostInTree";

const GroupsStore = types
  .model("ProjectGroups", {
    groups: types.array(Group),
    total: types.maybeNull(types.number),
    page: types.optional(types.maybeNull(types.number), 1),
    pageSize: types.optional(types.maybeNull(types.number), 10),
    current: types.maybeNull(types.reference(Group)),
    currentConversation: types.maybeNull(types.reference(Conversation)),
    backgrounds: types.maybeNull(types.array(Background))
  })
  .views(self => ({
    get all() {
      return self.groups;
    }
  }))
  .actions(self => {
    function setPage(page) {
      self.page = page;
    }

    function updateGroups(data) {
      self.groups = data;
    }

    const loadGroups = flow(function* loadGroups() {
      try {
        self.setCurrentGroup(null);
        self.setCurrentConversation(null);
        const json = yield api.getAll({
          page: self.page,
          pageSize: self.pageSize
        });

        if (json && json.groups) {
          updateGroups(json.groups);
          self.total = json.pagination.total;
        }
      } catch (err) {
        console.error("Failed to load groups ", err);
      }
    });

    const createGroup = flow(function* create(payload) {
      yield api.create(payload).then(() => self.loadGroups());
    });

    const subscribe = flow(function* subscribe(groupId) {
      yield api.subscribe(groupId);
      const data = yield api.get(groupId);
      const group = self.groups.find(g => g.id == groupId);
      group.participant = true;
      group.participants = data.participants;
      group.state = 1;
      group.participantsCount = +group.participantsCount + 1;
    });

    const request = flow(function* request(groupId) {
      yield api.subscribe(groupId);
      const group = self.groups.find(g => g.id == groupId);
      group.participant = true;
      group.state = 2;
      group.participantsCount = +group.participantsCount + 1;
    });

    const unsubscribe = flow(function* unsubscribe(groupId) {
      const result = yield api.unsubscribe(groupId);

      if (result.success) {
        const data = yield api.get(groupId);
        const group = self.groups.find(g => g.id == groupId);
        group.participant = false;
        group.state = 0;
        group.participants = data.participants;
        group.isAdmin = false;
        group.participantsCount = +group.participantsCount - 1;
      } else {
        notification.open({
          message: "Внимание",
          description: result.message
        });
      }
    });

    function setCurrentGroup(id) {
      self.current = id;
    }

    function setCurrentConversation(id) {
      self.currentConversation = id;
    }

    const getCurrent = flow(function* getCurrent(id) {
      const data = yield api.get(id);
      const group = self.groups.find(g => g.id == id);

      if (group) {
        Object.assign(group, data);
        self.currentGroup = group.id;
      } else {
        self.groups.push(data);
        self.currentGroup = data.id;
      }
      self.setCurrentGroup(data.id);
    });

    const getBackgrounds = flow(function* getBackgrounds() {
      const data = yield api.getBackgrounds();
      if (data) {
        self.backgrounds = data;
      }
    });

    const pin = flow(function* pin(conversationId) {
      yield api.pin(conversationId);
      const conversation = self.current.conversations.find(
        c => c.id == conversationId
      );
      conversation.isPinned = true;
    });

    const unpin = flow(function* unpin(conversationId) {
      yield api.unpin(conversationId);
      const conversation = self.current.conversations.find(
        c => c.id == conversationId
      );
      conversation.isPinned = false;
    });

    const updateBackground = flow(function* updateBackground(payload) {
      const avatar = yield api.updateBackground(payload);
      self.current.avatar = avatar;
    });

    const updateGroupTitle = flow(function* updateGroupTitle(payload) {
      yield api.updateGroupTitle(payload);
      self.current.title = payload.title;
    });

    const updateGroupShortDescription = flow(
      function* updateGroupShortDescription(payload) {
        yield api.updateGroupShortDescription(payload);
        self.current.shortDescription = payload.shortDescription;
      }
    );

    const makeAdmin = flow(function* makeAdmin(payload) {
      yield api.makeAdmin(payload);
      const participants = self.current.participants.map(p => {
        if (p.id == payload.id) {
          p.isAdmin = true;
          return Participant.create(getSnapshot(p));
        }
        return p;
      });

      self.current.participants = participants;
    });

    const removeAdmin = flow(function* removeAdmin(payload) {
      yield api.removeAdmin(payload);
      const participants = self.current.participants.map(p => {
        if (p.id == payload.id) {
          p.isAdmin = false;
          return Participant.create(getSnapshot(p));
        }
        return p;
      });
      self.current.participants = participants;
    });

    const approve = flow(function* approve(payload) {
      yield api.approve(payload);
      const participants = self.current.participants.map(p => {
        if (p.id == payload.id) {
          // TODO разобраться нужен ли isMember вообще
          p.isMember = true;
          p.state = 1;
          return Participant.create(getSnapshot(p));
        }
        return p;
      });
      self.current.participants = participants;
    });

    const removeFromGroup = flow(function* removeFromGroup(payload) {
      yield api.removeFromGroup(payload);
      self.current.participants = self.current.participants.filter(
        p => p.id !== payload.id
      );
    });

    const createConversation = flow(function* createConversation(payload) {
      const data = yield api.createConversation(payload);
      self.current.conversations.push(data);
    });

    const getConversation = flow(function* getConversation(id) {
      const data = yield api.getConversation(id);
      const conversation = self.current.conversations.find(c => c.id == id);
      Object.assign(conversation, data);
      self.setCurrentConversation(id);
    });

    const sendPost = flow(function* sendPost(payload) {
      const data = yield api.sendPost(payload);
      if (data.parentId) {
        const parentPost = findInTree(self.currentConversation.postsTree, data);
        parentPost.children.push(data);
      } else {
        self.currentConversation.postsTree.push(data);
      }
    });

    const deleteGroup = flow(function* deleteGroup(id) {
      yield api.deleteGroup(id);
      self.groups = self.groups.filter(g => g.id !== id);
    });

    return {
      setPage,
      createGroup,
      loadGroups,
      subscribe,
      request,
      unsubscribe,
      setCurrentGroup,
      getCurrent,
      getBackgrounds,
      pin,
      unpin,
      updateBackground,
      updateGroupTitle,
      updateGroupShortDescription,
      makeAdmin,
      removeAdmin,
      approve,
      removeFromGroup,
      createConversation,
      setCurrentConversation,
      getConversation,
      sendPost,
      deleteGroup
    };
  });

export default GroupsStore;
