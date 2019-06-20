import { types } from "mobx-state-tree";

const Notification = types.model("Notification", {
  id: types.identifierNumber,
  userId: types.maybeNull(types.number),
  description: types.maybeNull(types.string),
  avatar: types.maybeNull(types.string),
  createdAt: types.maybeNull(types.string)
});

export default Notification;
