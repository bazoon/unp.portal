import { types } from "mobx-state-tree";

const Organization = types.model("Organization", {
  id: types.identifierNumber,
  name: types.maybeNull(types.string),
  fullName: types.maybeNull(types.string),
  inn: types.maybeNull(types.string)
});

export default Organization;
