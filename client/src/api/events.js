import api from "./api";

export default {
  loadAll(payload) {
    return api.get("api/events/list/all", payload).then(({ data }) => {
      return data;
    });
  },
  get(id) {
    return api.get(`api/events/${id}`).then(({ data }) => {
      return data;
    });
  },
  deleteEvent(id) {
    return api.delete(`api/events/${id}`).then(({ data }) => {
      return data;
    });
  },
  create(payload) {
    return api.post("api/events/create", payload).then(({ data }) => {
      return data;
    });
  },
  loadUpcoming(date) {
    return api.get("api/events/upcoming", { date }).then(({ data }) => {
      return data;
    });
  }
};
