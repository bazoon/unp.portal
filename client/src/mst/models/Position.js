import { types } from "mobx-state-tree";

const Position = types.model("Position", {
  id: types.identifierNumber,
  name: types.maybeNull(types.string)
});

export default Position;
