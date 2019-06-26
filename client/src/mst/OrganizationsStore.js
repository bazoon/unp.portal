import { types, flow } from "mobx-state-tree";
import api from "../api/organizations";
import Organization from "./models/Organization";

const OrganizationsStore = types
  .model("OrganizationsStore", {
    items: types.array(Organization),
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
      loadAll,
      setPage
    };
  });

export default OrganizationsStore;
