import { types, flow } from "mobx-state-tree";
import File from "./models/File";
import api from "../api/login";

const CurrentUserStore = types
  .model("CurrentUserStore", {
    id: types.identifierNumber,
    userId: types.maybeNull(types.number),
    token: types.maybeNull(types.string),
    userName: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    isAdmin: types.maybeNull(types.boolean)
  })
  .actions(self => {
    const login = flow(function* login(payload) {
      const data = yield api.login(payload);
      setData(data);
    });

    const signup = flow(function* signup(payload) {
      const data = yield api.signup(payload);
      setData(data);
    });

    const setData = function setData(data) {
      const { token, userName, userId, avatar, isAdmin } = data;
      self.token = token;
      self.userName = userName;
      self.userId = userId;
      self.avatar = avatar;
      self.isAdmin = isAdmin;

      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userId", userId);
      localStorage.setItem("avatar", avatar);
      localStorage.setItem("isAdmin", isAdmin);
    };

    const logout = function logout() {
      api.logout();
      setData({
        token: "",
        userName: "",
        userId: -1,
        avatar: "",
        isAdmin: false
      });
    };

    return {
      login,
      signup,
      logout
    };
  });

export default CurrentUserStore.create({
  token: localStorage.getItem("token"),
  userName: localStorage.getItem("userName"),
  id: +localStorage.getItem("userId"),
  avatar: localStorage.getItem("avatar"),
  isAdmin: localStorage.getItem("isAdmin") === "true"
});
