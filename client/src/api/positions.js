import api from "./api";

export default {
  loadAll() {
    return api.get("admin/api/positions").then(({ data }) => {
      return data;
    });
  }
};
