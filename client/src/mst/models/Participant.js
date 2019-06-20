import { types, onSnapshot } from "mobx-state-tree";

const Participant = types.model("Participant", {
  id: types.identifierNumber,
  name: types.string,
  position: types.string,
  roleName: types.string,
  level: types.number,
  avatar: types.string,
  isAdmin: types.boolean,
  userId: types.maybe(types.number),
  state: types.maybeNull(types.number)
});

export default Participant;
