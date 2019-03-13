import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Preferences = State({
  initial: { preferences: [] },
  setPreferences(state, payload) {
    return { preferences: payload };
  }
});

Effect("getPreferences", payload => {
  api.get("api/profile_preferences/list").then(response => {
    Actions.setPreferences(response.data);
  });
});

Effect("savePreferences", payload => {
  api.post("api/profile_preferences/save", payload).then(response => {
    Actions.getPreferences();
  });
});

export default Preferences;
