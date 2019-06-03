import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const userToken = localStorage.getItem("token");
const userName = localStorage.getItem("userName");
const userAvatar = localStorage.getItem("avatar");
const isAdmin = JSON.parse(localStorage.getItem("isAdmin"));

const LoginForm = State({
  initial: {
    token: userToken,
    userName,
    userId: localStorage.getItem("userId"),
    loginFailed: false,
    avatar: userAvatar,
    isAdmin
  }
  // setLogin(state, { userName, token, userId, avatar, isAdmin }) {
  //   return { userName, token, loginFailed: false, userId, avatar, isAdmin };
  // },
  // setLoginFailed(state) {
  //   return { ...state, loginFailed: true };
  // },
  // setLogout(state) {
  //   return { ...state, token: undefined, userName: undefined };
  // }
});

// Effect("login", ({ userName, password }) => {
//   api
//     .post("api/user/login", {
//       userName,
//       password
//     })
//     .then(response => {
//       const { token, userName, userId, avatar, isAdmin } = response.data;
//       localStorage.setItem("token", token);
//       localStorage.setItem("userName", userName);
//       localStorage.setItem("userId", userId);
//       localStorage.setItem("avatar", avatar);
//       localStorage.setItem("isAdmin", isAdmin);
//       Actions.setLogin(response.data);
//       return true;
//     })
//     .catch(() => {
//       Actions.setLoginFailed();
//       return false;
//     });
// });

// Effect("signup", ({ userName, password }) => {
//   api
//     .post("api/user/signup", {
//       userName,
//       password
//     })
//     .then(response => {
//       const { token, userName, userId, avatar, isAdmin } = response.data;
//       localStorage.setItem("token", token);
//       localStorage.setItem("userName", userName);
//       localStorage.setItem("userId", userId);
//       localStorage.setItem("avatar", avatar);
//       localStorage.setItem("isAdmin", isAdmin);
//       Actions.setLogin(response.data);
//       return true;
//     })
//     .catch(() => {
//       Actions.setLoginFailed();
//       return false;
//     });
// });

// Effect("logout", () => {
//   localStorage.removeItem("token");
//   localStorage.removeItem("userName");
//   Actions.setLogout();
// });

export default LoginForm;
