import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const projectGroups = State({
  initial: { groups: [] },
  setProjectGroups(state, payload) {
    return { groups: payload };
  }
});

Effect("getProjectGroups", type => {
  const urls = {
    my: "api/projectGroups/list/my",
    created: "api/projectGroups/list/created",
    all: "api/projectGroups/list"
  };

  api.get(urls[type]).then(response => {
    Actions.setProjectGroups(response.data);
  });
});

export default projectGroups;
