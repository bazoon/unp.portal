import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Preferences = State({
  initial: { profile: {} },
  setPreferences(state, payload) {
    return { profile: payload };
  }
});

Effect("getPreferences", userId => {
  api.get("api/profile_preferences/get", { userId }).then(response => {
    Actions.setPreferences(response.data);
  });
});

Effect("savePreferences", payload => {
  api.post("api/profile_preferences/save", payload).then(response => {
    Actions.getPreferences();
  });
});

export default Preferences;
