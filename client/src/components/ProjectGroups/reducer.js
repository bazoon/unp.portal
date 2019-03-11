import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const projectGroups = State({
  initial: { groups: [] },
  setProjectGroups(state, payload) {
    return { groups: payload };
  }
});

Effect("getProjectGroups", payload => {
  api.get("api/projectGroups/list").then(response => {
    Actions.setProjectGroups(response.data);
  });
});

export default projectGroups;
