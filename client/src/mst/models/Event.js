import { types } from "mobx-state-tree";
import File from "./File";

const Group = types.model("Event", {
  id: types.identifierNumber,
  usersCount: types.optional(types.maybeNull(types.number), 0),
  startDate: types.optional(types.maybeNull(types.string), ""),
  remindAt: types.optional(types.maybeNull(types.string), ""),
  title: types.optional(types.maybeNull(types.string), ""),
  description: types.optional(types.string, ""),
  files: types.optional(types.array(File), [])
});

export default Group;
