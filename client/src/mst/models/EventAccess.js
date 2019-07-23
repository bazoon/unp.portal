import { types } from "mobx-state-tree";

const EventAcccess = types.model("EventAcccess", {
  id: types.identifierNumber,
  userId: types.maybeNull(types.integer),
  groupId: types.maybeNull(types.integer)
});

export default EventAcccess;
