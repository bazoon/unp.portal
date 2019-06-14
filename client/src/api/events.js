import api from "./api";

export default {
  loadAll(payload) {
    return api.get("api/events/list/all", payload).then(({ data }) => {
      return data;
    });
  },
  create(payload) {
    return api.post("api/events/create", payload).then(({ data }) => {
      return data;
    });
  },
  loadUpcoming() {
    return api.get("api/events/upcoming").then(({ data }) => {
      return data;
    });
  }
};
