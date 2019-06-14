import api from "./api";

export default {
  loadAll() {
    return api.get("admin/api/organizations").then(({ data }) => {
      return data;
    });
  }
};
