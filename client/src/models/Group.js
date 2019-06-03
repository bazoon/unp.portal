import { observable, action, computed } from "mobx";
import File from "./File";
import Participant from "./Participant";
import Conversation from "./Conversation";
import findInTree from "../utils/findPostInTree";

class Group {
  @observable id;

  @observable isOpen;

  @observable title;

  @observable conversationsCount;

  @observable isAdmin;

  @observable isOpen;

  @observable participant;

  @observable participantsCount;

  @observable description;

  @observable shortDescription;

  @observable avatar;

  @observable participants;

  @observable files;

  @observable conversations;

  @observable currentConversation = {};

  constructor(g, api = {}) {
    this.api = api;
    Object.assign(this, g);

    if (g.participants) {
      this.participants = g.participants.map(p => new Participant(p));
    }

    if (g.files) {
      this.files = g.files.map(f => new File(f));
    }

    if (g.conversations) {
      this.conversations = g.conversations.map(c => new Conversation(c));
    }
  }

  loadConversation(id) {
    return this.api.getConversation(id).then(data => {
      this.currentConversation = new Conversation(data);
    });
  }

  sendPost(payload) {
    return this.api.sendPost(payload).then(data => {
      if (data.parentId) {
        const parentPost = findInTree(this.currentConversation.postsTree, data);
        parentPost.children.push(data);
      } else {
        this.currentConversation.postsTree.push(data);
      }
    });
  }

  @computed
  get pinned() {
    return this.conversations.filter(c => c.isPinned);
  }
}

export default Group;
