import { types } from "mobx-state-tree";

const FoundChatMessage = types.model("FoundChatMessage", {
  id: types.identifierNumber,
  message: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  userName: types.maybeNull(types.string),
  createdAt: types.maybeNull(types.string),
  channelId: types.maybeNull(types.integer)
});

export default FoundChatMessage;
