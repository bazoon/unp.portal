import axios from "axios";

export default {
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
