import { types } from "mobx-state-tree";

const EventAcccess = types.model("EventAcccess", {
  id: types.identifierNumber,
  accessType: types.integer,
  entityId: types.integer
});

export default EventAcccess;
