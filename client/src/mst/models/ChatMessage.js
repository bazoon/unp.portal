import { types } from "mobx-state-tree";
import File from "./File";

const ChatMessage = types.model("ChatMessage", {
  id: types.identifierNumber,
  message: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  type: types.optional(types.string, "text"),
  userName: types.maybeNull(types.string),
  userId: types.maybeNull(types.integer),
  files: types.array(File),
  seen: types.maybeNull(types.boolean),
  createdAt: types.maybeNull(types.string)
});

export default ChatMessage;
