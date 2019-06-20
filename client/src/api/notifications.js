import api from "./api";

export default {
  load() {
    return api.get("api/notifications").then(({ data }) => {
      return data;
    });
  }
};
