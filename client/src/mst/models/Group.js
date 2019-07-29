import { types, onSnapshot } from "mobx-state-tree";
import File from "./File";
import Participant from "./Participant";
import Conversation from "./Conversation";
import api from "../../api/projectGroups";

const Group = types
  .model("ProjectGroup", {
    id: types.identifierNumber,
    title: types.optional(types.maybeNull(types.string), ""),
    conversationsCount: types.optional(types.number, 0),
    isAdmin: types.optional(types.boolean, false),
    canPost: types.optional(types.boolean, false),
    state: types.optional(types.number, 0),
    isOpen: types.optional(types.boolean, true),
    participant: types.optional(types.boolean, false),
    participantsCount: types.optional(types.number, 0),
    description: types.optional(types.string, ""),
    shortDescription: types.optional(types.string, ""),
    avatar: types.optional(types.string, ""),
    participants: types.optional(types.array(Participant), []),
    files: types.optional(types.array(File), []),
    conversations: types.optional(types.array(Conversation), [])
  })
  .views(self => ({
    get pinned() {
      return self.conversations.filter(conversation => conversation.isPinned);
    }
  }));

export default Group;
