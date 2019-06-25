import { types } from "mobx-state-tree";
import File from "./File";
import EventAcccess from "./EventAccess";

const Event = types.model("Event", {
  id: types.identifierNumber,
  usersCount: types.optional(types.maybeNull(types.number), 0),
  accessType: types.maybeNull(types.integer),
  startDate: types.optional(types.maybeNull(types.string), ""),
  remindAt: types.optional(types.maybeNull(types.string), ""),
  title: types.optional(types.maybeNull(types.string), ""),
  description: types.optional(types.string, ""),
  files: types.optional(types.array(File), []),
  accesses: types.array(EventAcccess)
});

export default Event;
