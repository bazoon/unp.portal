import { types, flow } from "mobx-state-tree";
import FeedItem from "./models/FeedItem";
import api from "../api/feed";

const FeedStore = types
  .model("FeedStore", {
    items: types.optional(types.array(FeedItem), [])
  })
  .views(self => {
    function getAll() {
      return self.items;
    }

    return {
      getAll
    };
  })
  .actions(self => {
    const load = flow(function* load() {
      const items = yield api.load();
      if (items) {
        self.items = items;
      }
    });

    return {
      load
    };
  });

export default FeedStore;
