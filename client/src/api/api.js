import axios from "axios";

export default {
  get: url => axios.get(url),
  post: (url, data) => axios.post(url, data)
};
