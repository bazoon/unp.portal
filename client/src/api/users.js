import api from "./api";

export default {
  loadAll() {
    return api.get("api/users").then(({ data }) => {
      return data;
    });
  },
  loadAllUsers() {
    return api.get("api/users").then(({ data }) => {
      return data;
    });
  },
  get(id) {
    return api.get(`admin/api/users/${id}`).then(({ data }) => {
      return data;
    });
  },
  update(payload) {
    return api.put("admin/api/users", payload).then(({ data }) => {
      return data;
    });
  },
  deleteUser(id) {
    return api.delete("admin/api/users", { id }).then(({ data }) => {
      return data;
    });
  },
  search(query) {
    return api.get(`api/users/search/${query}`).then(({ data }) => data);
  }
};
