import api from "./api";

export default {
  loadAll() {
    return api.get("api/users").then(({ data }) => {
      return data;
    });
  }
};
