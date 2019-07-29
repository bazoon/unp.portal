import { types } from "mobx-state-tree";
import File from "./File";
import EventAcccess from "./EventAccess";
import EventParticipant from "./EventParticipant";

const Event = types.model("Event", {
  id: types.identifierNumber,
  canEdit: types.maybeNull(types.boolean),
  isPublic: types.maybeNull(types.boolean),
  userName: types.maybeNull(types.string),
  userAvatar: types.maybeNull(types.string),
  usersCount: types.optional(types.maybeNull(types.number), 0),
  accessType: types.maybeNull(types.integer),
  startDate: types.optional(types.maybeNull(types.string), ""),
  remindAt: types.optional(types.maybeNull(types.string), ""),
  title: types.optional(types.maybeNull(types.string), ""),
  description: types.optional(types.string, ""),
  files: types.optional(types.array(File), []),
  accesses: types.optional(types.array(EventAcccess), []),
  participants: types.optional(types.array(EventParticipant), [])
});

export default Event;
