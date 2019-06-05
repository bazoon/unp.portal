import { types, onSnapshot, flow } from "mobx-state-tree";

const Background = types.model("Background", {
  id: types.identifier,
  background: types.string
});

export default Background;
