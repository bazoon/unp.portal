import axios from "axios";
import currentUser from "../stores/currentUser";

const api = {
  get: (url, params = {}) => {
    const token = `Bearer ${localStorage.getItem("token")}`;
    const config = {
      headers: { authorization: token },
      params
    };

    return axios.get("/" + url, config).catch(e => {
      if (e.request.status === 401) {
        currentUser.logout();
      }
    });
  },
  post: (url, data) => {
    const token = `Bearer ${localStorage.getItem("token")}`;
    const config = {
      headers: { authorization: token }
    };

    return axios.post("/" + url, data, config).catch(e => {
      if (e.request.status === 401) {
        currentUser.logout();
      }
    });
  }
};
window.api = api;
export default api;
