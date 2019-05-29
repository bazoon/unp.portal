import axios from "axios";

const api = {
  get: (url, params = {}) => {
    const token = `Bearer ${localStorage.getItem("token")}`;
    const config = {
      headers: { authorization: token },
      params
    };

    return axios.get("/" + url, config);
  },
  post: (url, data) => {
    const token = `Bearer ${localStorage.getItem("token")}`;
    const config = {
      headers: { authorization: token }
    };

    return axios.post("/" + url, data, config);
  }
};
window.api = api;
export default api;
