import { types, onSnapshot } from "mobx-state-tree";
import File from "./File";
import Participant from "./Participant";
import Conversation from "./Conversation";
import api from "../../api/projectGroups";

const Group = types.model("ProjectGroup", {
  id: types.identifier,
  title: types.string,
  conversationsCount: types.number,
  isAdmin: types.boolean,
  state: types.number,
  isOpen: types.boolean,
  participant: types.boolean,
  participantsCount: types.number,
  description: types.string,
  shortDescription: types.string,
  avatar: types.string,
  participants: types.array(Participant),
  files: types.array(File),
  conversations: types.array(Conversation)
  // currentConversation: types.number
});

export default Group;
