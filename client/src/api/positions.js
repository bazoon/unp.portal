import api from "./api";

export default {
  loadAll() {
    return api.get("admin/api/positions").then(({ data }) => {
      return data;
    });
  },
  create(payload) {
    return api.post("admin/api/positions", payload).then(({ data }) => {
      return data;
    });
  },
  update(payload) {
    return api.put("admin/api/positions", payload).then(({ data }) => {
      return data;
    });
  }
};
