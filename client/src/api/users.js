import api from "./api";

export default {
  loadAll() {
    return api.get("api/users").then(({ data }) => {
      return data;
    });
  },
  loadAllUsers() {
    return api.get("admin/api/users").then(({ data }) => {
      return data;
    });
  },
  get(id) {
    return api.get("admin/api/users/get", { id }).then(({ data }) => {
      return data;
    });
  },
  update(payload) {
    return api.post("admin/api/users/update", payload).then(({ data }) => {
      return data;
    });
  }
};
