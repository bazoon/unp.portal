import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Preferences = State({
  initial: { profile: {}, notificationPreferences: [] },
  setPreferences(state, payload) {
    return { ...state, profile: payload };
  },
  setNotificationPreferences(state, payload) {
    return { ...state, notificationPreferences: payload };
  }
});

Effect("getPreferences", userId => {
  api.get("api/profile_preferences/get", { userId }).then(response => {
    Actions.setPreferences(response.data);
  });
});

Effect("getNotificationPreferences", userId => {
  api
    .get("api/profile_preferences/notifications", { userId })
    .then(response => {
      Actions.setNotificationPreferences(response.data);
    });
});

Effect("saveNotificationPreferences", payload => {
  api.post("api/profile_preferences/save", payload).then(() => {
    Actions.getNotificationPreferences(payload.userId);
  });
});

export default Preferences;
