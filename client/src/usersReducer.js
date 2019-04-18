import { State, Effect, Actions } from "jumpstate";
import api from "./api/api";

const Users = State({
  initial: {
    users: []
  },
  setAllUsers(state, payload) {
    return { ...state, users: payload };
  }
});

Effect("getAllUsers", () => {
  api.get("api/users/list/all").then(response => {
    Actions.setAllUsers(response.data);
  });
});

export default Users;
