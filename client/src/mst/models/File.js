import { types, onSnapshot } from "mobx-state-tree";

const File = types.model("File", {
  id: types.identifier,
  name: types.string,
  url: types.string,
  size: types.maybeNull(types.number)
});

export default File;
