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
      const position = yield api.create(payload);
      if (position) {
        self.items.push(position);
      }
    });

    const update = flow(function* update(payload) {
      const position = yield api.update(payload);
      self.items = self.items.map(item => {
        return item.id === position.id ? position : item;
      });
    });

    const loadAll = flow(function* loadAll(payload) {
      const items = yield api.loadAll({
        page: self.page,
        pageSize: self.pageSize
      });
      if (items) {
        self.items = items;
      }
    });

    const setPage = function setPage(page) {
      self.page = page;
      self.loadAll();
    };

    return {
      create,
      update,
      loadAll,
      setPage
    };
  });

export default PositionsStore;
