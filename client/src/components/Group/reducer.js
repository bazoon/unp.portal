import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const projectGroups = State({
  initial: { groups: [] },
  setProjectGroup(state, payload) {
    return { group: payload };
  }
});

Effect("getProjectGroup", projectGroupId => {
  api.get("api/projectGroups/get", { id: projectGroupId }).then(response => {
    Actions.setProjectGroup(response.data);
  });
});

export default projectGroups;
