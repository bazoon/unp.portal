import api from "./api";

export default {
  loadAll(payload) {
    return api.get("api/events", payload).then(({ data }) => {
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
    return api.post("api/events", payload).then(({ data }) => {
      return data;
    });
  },
  update(id, payload) {
    return api.put(`api/events/${id}`, payload).then(({ data }) => {
      return data;
    });
  },
  loadUpcoming(date) {
    return api.get("api/events/upcoming", { date }).then(({ data }) => {
      return data;
    });
  },
  deleteFile(payload) {
    return api.delete("api/events/files", payload).then(({ data }) => data);
  },
  uploadFiles(payload) {
    return api.post("api/events/files", payload).then(({ data }) => data);
  },
  search(query) {
    return api.get(`api/events/search/${query}`).then(({ data }) => data);
  }
};
