import { types } from "mobx-state-tree";

const EventParticipant = types.model("EventParticipant", {
  id: types.identifierNumber,
  name: types.maybeNull(types.string)
});

export default EventParticipant;
