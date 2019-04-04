import axios from "axios";

const api = {
  get: (url, params = {}) => {
    const token = localStorage.getItem("token");

    const config = {
      headers: { token },
      params
    };

    return axios.get(url, config);
  },
  post: (url, data) => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { token }
    };

    return axios.post(url, data, config);
  }
};
window.api = api;
export default api;
