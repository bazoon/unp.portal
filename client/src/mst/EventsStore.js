import { types, flow } from "mobx-state-tree";
import groupBy from "lodash/groupBy";
import moment from "moment";
import Event from "./models/Event";
import api from "../api/events";

const CurrentUserStore = types
  .model("CurrentUserStore", {
    events: types.array(Event),
    upcoming: types.array(Event),
    total: types.maybeNull(types.number),
    page: types.optional(types.maybeNull(types.number), 1),
    pageSize: types.optional(types.maybeNull(types.number), 10)
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
    });

    const loadAll = flow(function* loadAll(payload) {
      const data = yield api.loadAll({
        page: self.page,
        pageSize: self.pageSize
      });
      self.events = data.events;
      self.total = data.pagination.total;
    });

    const loadUpcoming = flow(function* loadUpcoming() {
      const events = yield api.loadUpcoming();
      self.upcoming = events;
    });

    const setPage = function setPage(page) {
      self.page = page;
      self.loadAll();
    };

    return {
      create,
      loadAll,
      setPage,
      loadUpcoming
    };
  });

export default CurrentUserStore;
