import { types, flow } from "mobx-state-tree";
import api from "../api/notifications";
import Notification from "./models/Notification";

const NotificationsStore = types
  .model("NotificationsStore", {
    items: types.array(Notification)
  })
  .views(self => ({
    get unseen() {
      return self.items.slice(0, 5);
    }
  }))
  .actions(self => {
    const load = flow(function* load() {
      self.items = yield api.load();
    });

    return {
      load
    };
  });

export default NotificationsStore;
