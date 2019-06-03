import { observable } from "mobx";
import api from "../api/login";

class User {
  @observable token;

  @observable userName;

  @observable userId;

  @observable loginFailed;

  @observable avatar;

  @observable isAdmin;

  constructor(loginApi) {
    this.api = loginApi;
    window.u = this;
    this.token = localStorage.getItem("token");
    this.userName = localStorage.getItem("userName");
    this.userId = localStorage.getItem("userId");
    this.avatar = localStorage.getItem("avatar");
    this.isAdmin = localStorage.getItem("isAdmin");
  }

  login(userName, password) {
    return this.api.login(userName, password).then(data => {
      this.setData(data);
    });
  }

  signup(userName, password) {
    return this.api.signup(userName, password).then(data => {
      this.setData(data);
    });
  }

  setData(data) {
    const { token, userName, userId, avatar, isAdmin } = data;
    this.token = token;
    this.userName = userName;
    this.userId = userId;
    this.avatar = avatar;
    this.isAdmin = isAdmin;
  }

  logout() {
    this.api.logout();
    this.setData({
      token: undefined,
      userName: undefined,
      userId: undefined,
      avatar: undefined,
      isAdmin: undefined
    });
    window.foo = this;
  }
}

export default new User(api);
