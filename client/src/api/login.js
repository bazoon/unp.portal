import api from "./api";

export default {
  signup(payload) {
    return api.post("api/user/signup", payload, true).then(({ data }) => {
      const { token, userName, userId, avatar, isAdmin } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userId", userId);
      localStorage.setItem("avatar", avatar);
      localStorage.setItem("isAdmin", isAdmin);
      return data;
    });
  },
  login(payload) {
    return api.post("api/user/login", payload, true).then(({ data }) => {
      const { token, userName, userId, avatar, isAdmin } = data;
      localStorage.setItem("token", token);
      localStorage.setItem("userName", userName);
      localStorage.setItem("userId", userId);
      localStorage.setItem("avatar", avatar);
      localStorage.setItem("isAdmin", isAdmin);
      return data;
    });
  },
  logout() {
    return api.post("api/user/logout");
  }
};
