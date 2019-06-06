import api from "./api";

export default {
  signup(userName, password) {
    return api
      .post("api/user/signup", {
        userName,
        password
      })
      .then(({ data }) => {
        return data;
      });
  },
  login(userName, password) {
    return api
      .post("api/user/login", {
        userName,
        password
      })
      .then(({ data }) => {
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
