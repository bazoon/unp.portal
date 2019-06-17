import api from "./api";

export default {
  signup(payload) {
    return api.post("api/user/signup", payload, true).then(({ data }) => {
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
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("avatar");
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");
  }
};
