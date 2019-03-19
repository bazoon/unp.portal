const utils = {
  isLoggedIn() {
    return utils.getToken() != null;
  },
  getToken() {
    return localStorage.getItem("token");
  }
};

export default utils;
