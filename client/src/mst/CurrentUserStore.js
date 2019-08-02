import { types, flow } from "mobx-state-tree";
import File from "./models/File";
import api from "../api/login";
import usersApi from "../api/users";
import utils from "../utils";
import cookies from "../utils/cookies";

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
      self.setData(data);
    });

    const signup = flow(function* signup(payload) {
      const data = yield api.signup(payload);
      self.setData(data);
    });

    const setData = function setData(data) {
      const { token, userName, userId, avatar, isAdmin } = data;
      self.userId = userId;
      self.token = token;
      self.userName = userName;
      self.userId = userId;
      self.avatar = avatar;
      self.isAdmin = isAdmin;
      self.token = token;
    };

    const clearData = function clearData() {
      self.userId = -1;
      self.token = "";
      self.userName = "";
      self.userId = -1;
      self.avatar = "";
      self.isAdmin = false;
      self.token = "";
    };

    const logout = flow(function* logout() {
      self.clearData();
      yield api.logout();
      self.setData({});
    });
    const update = function update(user) {
      if (!user) return;
      self.userId = user.userId;
      self.name = user.name;
      self.avatar = user.avatar;
      self.isAdmin = user.isAdmin;
      localStorage.setItem("userId", user.userId);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("avatar", user.avatar);
      localStorage.setItem("isAdmin", user.isAdmin);
    };

    const getCurrent = flow(function* getCurrent() {
      const data = yield usersApi.getCurrent();
      self.update(data);
    });

    return {
      login,
      signup,
      logout,
      setData,
      update,
      clearData,
      getCurrent
    };
  });

export default CurrentUserStore.create({
  token: utils.getToken("token"),
  userName: localStorage.getItem("userName"),
  id: +localStorage.getItem("userId"),
  userId: +localStorage.getItem("userId"),
  avatar: localStorage.getItem("avatar"),
  isAdmin: localStorage.getItem("isAdmin") === "true"
});
