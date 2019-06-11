import api from "./api";

export default {
  loadAll() {
    return api.get("api/files").then(({ data }) => {
      return data;
    });
  },
  upload(payload) {
    return api.post("api/files", payload);
  }
};
