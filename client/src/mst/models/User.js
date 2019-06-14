import { types } from "mobx-state-tree";
import Organization from "./Organization";
import Position from "./Position";

const User = types.model("User", {
  id: types.identifierNumber,
  avatar: types.maybeNull(types.string),
  login: types.maybeNull(types.string),
  name: types.maybeNull(types.string),
  isAdmin: types.maybeNull(types.boolean),
  organization: types.maybeNull(Organization),
  position: types.maybeNull(Position)
});

export default User;
