import { types } from "mobx-state-tree";

const FoundChatMessage = types.model("FoundChatMessage", {
  id: types.identifierNumber,
  message: types.maybeNull(types.string),
  channelId: types.maybeNull(types.integer)
});

export default FoundChatMessage;
