import api from "./api";

export default {
  load() {
    return api.get("api/notifications").then(({ data }) => {
      return data;
    });
  },
  markAllAsSeen() {
    return api.post("api/notifications/seen").then(({ data }) => {
      return data;
    });
  },
  markAsSeen(id) {
    return api.put(`api/notifications/seen/${id}`).then(({ data }) => {
      return data;
    });
  }
};
