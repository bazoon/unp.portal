import axios from "axios";

const token = `Bearer ${localStorage.getItem("token")}`;

const api = {
  get: (url, params = {}) => {
    const config = {
      headers: { authorization: token },
      params
    };

    return axios.get("/" + url, config);
  },
  post: (url, data) => {
    const config = {
      headers: { authorization: token }
    };

    return axios.post("/" + url, data, config);
  }
};
window.api = api;
export default api;
