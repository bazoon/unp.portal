import { types, flow } from "mobx-state-tree";
import groupBy from "lodash/groupBy";
import moment from "moment";
import Event from "./models/Event";
import api from "../api/events";

const CurrentUserStore = types
  .model("CurrentUserStore", {
    events: types.optional(types.array(Event), []),
    upcoming: types.maybeNull(types.array(Event)),
    total: types.maybeNull(types.number),
    page: types.optional(types.maybeNull(types.number), 1),
    pageSize: types.optional(types.maybeNull(types.number), 10),
    currentDate: types.maybeNull(types.Date),
    currentEvent: types.maybeNull(Event)
  })
  .views(self => ({
    get groupedByDays() {
      return groupBy(self.events, e => {
        return moment(e.startDate).format("DD MMMM YYYY");
      });
    },
    get upcomingGroupedByDays() {
      return groupBy(self.upcoming, e => {
        return moment(e.startDate).format("DD MMMM YYYY");
      });
    }
  }))
  .actions(self => {
    const create = flow(function* create(payload) {
      yield api.create(payload);
      self.loadAll();
      self.loadUpcoming();
    });

    const update = flow(function* update(id, payload) {
      yield api.update(id, payload);
      self.loadAll();
      self.loadUpcoming();
    });

    const get = flow(function* get(id) {
      const data = yield api.get(id);
      self.currentEvent = data;
    });

    const loadAll = flow(function* loadAll() {
      const data = yield api.loadAll({
        page: self.page,
        pageSize: self.pageSize
      });

      if (data && data.events) {
        self.events = data.events;
        self.total = data.pagination.total;
      }
    });

    const loadUpcoming = flow(function* loadUpcoming() {
      const events = yield api.loadUpcoming(self.currentDate);
      self.upcoming = events;
    });

    const deleteEvent = flow(function* deleteEvent(id) {
      yield api.deleteEvent(id);
      self.events = self.events.filter(event => event.id !== id);
    });

    const setPage = function setPage(page) {
      self.page = page;
      self.loadAll();
    };

    const setCurrentDate = flow(function* setCurrentDate(date) {
      self.currentDate = date;
      const events = yield api.loadUpcoming(date);
      self.upcoming = events;
    });

    const deleteFile = flow(function* deleteFile(fileId) {
      yield api.deleteFile({ fileId });
      self.currentEvent.files = self.currentEvent.files.filter(
        file => file.id != fileId
      );
    });

    const uploadFiles = flow(function* uploadFiles(payload) {
      const files = yield api.uploadFiles(payload);

      if (files) {
        self.currentEvent.files = self.currentEvent.files.concat(files);
      }
    });

    return {
      get,
      create,
      update,
      loadAll,
      setPage,
      loadUpcoming,
      deleteEvent,
      setCurrentDate,
      deleteFile,
      uploadFiles
    };
  });

export default CurrentUserStore;
