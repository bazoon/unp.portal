import { types } from "mobx-state-tree";
import File from "./File";

const ChatMessage = types.model("ChatMessage", {
  id: types.identifierNumber,
  message: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  type: types.string,
  userName: types.maybeNull(types.string),
  files: types.array(File),
  seen: types.maybeNull(types.boolean)
});

export default ChatMessage;
