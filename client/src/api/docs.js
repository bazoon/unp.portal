import api from "./api";

export default {
  loadAll() {
    return api.get("api/files").then(({ data }) => {
      return data;
    });
  },
  upload(payload) {
    return api.post("api/files", payload);
  },
  deleteFile(id) {
    return api.delete(`api/files/${id}`);
  },
  search(query) {
    return api.get(`api/files/search/${query}`).then(({ data }) => data);
  }
};
