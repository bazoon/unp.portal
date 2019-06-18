import { types, flow } from "mobx-state-tree";
import api from "../api/positions";
import Position from "./models/Position";

const PositionsStore = types
  .model("PositionsStore", {
    items: types.array(Position),
    total: types.maybeNull(types.number),
    page: types.optional(types.maybeNull(types.number), 1),
    pageSize: types.optional(types.maybeNull(types.number), 10)
  })
  .views(self => ({}))
  .actions(self => {
    const create = flow(function* create(payload) {
      yield api.create(payload);
      self.loadAll();
    });

    const loadAll = flow(function* loadAll(payload) {
      self.items = yield api.loadAll({
        page: self.page,
        pageSize: self.pageSize
      });
    });

    const setPage = function setPage(page) {
      self.page = page;
      self.loadAll();
    };

    return {
      create,
      loadAll,
      setPage
    };
  });

export default PositionsStore;