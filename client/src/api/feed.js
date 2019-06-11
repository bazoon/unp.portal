import api from "./api";

export default {
  load() {
    return api.get("api/feed").then(({ data }) => {
      return data;
    });
  }
};
