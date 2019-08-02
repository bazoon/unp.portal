import cookies from "./utils/cookies";

const utils = {
  isLoggedIn() {
    return utils.getToken() != null;
  },
  getToken() {
    return cookies.getCookie("token");
  }
};

export default utils;
