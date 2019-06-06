import { types, flow } from "mobx-state-tree";
import File from "./models/File";
import api from "../api/login";

const CurrentUserStore = types
  .model("CurrentUserStore", {
    id: types.identifierNumber,
    token: types.maybeNull(types.string),
    userName: types.maybeNull(types.string),
    avatar: types.maybeNull(types.string),
    isAdmin: types.maybeNull(types.boolean)
  })
  .actions(self => {
    const login = flow(function* login(userName, password) {
      const data = yield api.login(userName, password);
      setData(data);
    });

    const signup = flow(function* signup(userName, password) {
      const data = yield api.signup(userName, password);
      setData(data);
    });

    const setData = function setData(data) {
      const { token, userName, userId, avatar, isAdmin } = data;
      self.token = token;
      self.userName = userName;
      self.id = userId;
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
        token: undefined,
        userName: undefined,
        userId: undefined,
        avatar: undefined,
        isAdmin: undefined
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
