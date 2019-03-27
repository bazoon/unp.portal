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
  post: (url, data) => axios.post(url, data)
};
window.api = api;
export default api;
