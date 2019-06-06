import { types, onSnapshot, flow } from "mobx-state-tree";

const Background = types.model("Background", {
  id: types.identifierNumber,
  background: types.string
});

export default Background;
