import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const userToken = localStorage.getItem("token");
const userName = localStorage.getItem("userName");

const LoginForm = State({
  initial: { token: userToken, userName, loginFailed: false },
  setLogin(state, { userName, token }) {
    return { userName, token, loginFailed: false };
  },
  setLoginFailed(state) {
    return { ...state, loginFailed: true };
  },
  setLogout(state) {
    return { ...state, token: undefined, userName: undefined };
  }
});

Effect("login", ({ userName, password }) => {
  api
    .post("/api/user/login", {
      userName,
      password
    })
    .then(response => {
      const { token, userName } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);
      Actions.setLogin(response.data);
      return true;
    })
    .catch(() => {
      Actions.setLoginFailed();
      return false;
    });
});

Effect("logout", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  Actions.setLogout();
});

export default LoginForm;
