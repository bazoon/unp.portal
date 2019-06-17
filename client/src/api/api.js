import axios from "axios";
import currentUserStore from "../mst/CurrentUserStore";

const api = {
  get: (url, params = {}, skipTokenCheck) => {
    const storedToken = localStorage.getItem("token");

    if (!skipTokenCheck && (!storedToken || storedToken === "undefined")) {
      return Promise.resolve({ data: null });
    }

    const token = `Bearer ${storedToken}`;
    const config = {
      headers: { authorization: token },
      params
    };

    return axios.get("/" + url, config).catch(e => {
      if (e.request.status === 401) {
        currentUserStore.logout();
      }
    });
  },
  post: (url, data, skipTokenCheck) => {
    const storedToken = localStorage.getItem("token");
    if (!skipTokenCheck) {
      if (!skipTokenCheck && (!storedToken || storedToken === "undefined")) {
        return Promise.resolve({ data: null });
      }
    }
    const token = `Bearer ${storedToken}`;
    const config = {
      headers: { authorization: token }
    };

    return axios.post("/" + url, data, config).catch(e => {
      if (e.request.status === 401) {
        currentUserStore.logout();
      }
    });
  }
};
window.api = api;
export default api;
