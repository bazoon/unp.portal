import { types, flow } from "mobx-state-tree";
import api from "../api/notifications";
import Notification from "./models/Notification";

const NotificationsStore = types
  .model("NotificationsStore", {
    items: types.array(Notification)
  })
  .views(self => ({
    get unseen() {
      const u = self.items.filter(i => !i.seen);
      return u;
    }
  }))
  .actions(self => {
    const load = flow(function* load() {
      const items = yield api.load();
      if (items) {
        self.items = items;
      }
    });

    const mark = function(id) {
      const item = self.items.find(i => i.id == id);
      if (item) {
        item.seen = true;
      }
    };

    const markAsSeen = flow(function* markAsSeen(id) {
      yield api.markAsSeen(id);
      self.mark(id);
    });

    const markAllAsSeen = flow(function* markAllAsSeen() {
      yield api.markAllAsSeen();
      self.items = self.items.map(i => ({ ...i, seen: true }));
    });

    return {
      load,
      markAsSeen,
      mark,
      markAllAsSeen
    };
  });

export default NotificationsStore;
