import axios from "axios";

export default {
  get: (url, params = {}) => axios.get(url, { params }),
  post: (url, data) => axios.post(url, data)
};
