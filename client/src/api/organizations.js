import api from "./api";

export default {
  loadAll() {
    return api.get("admin/api/organizations").then(({ data }) => {
      return data;
    });
  },
  create(payload) {
    return api.post("admin/api/organizations", payload).then(({ data }) => {
      return data;
    });
  },
  update(payload) {
    return api.put("admin/api/organizations", payload).then(({ data }) => {
      return data;
    });
  }
};
