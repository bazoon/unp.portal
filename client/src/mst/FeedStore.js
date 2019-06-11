import { types, flow } from "mobx-state-tree";
import FeedItem from "./models/FeedItem";
import api from "../api/feed";

const FeedStore = types
  .model("FeedStore", {
    items: types.array(FeedItem)
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
      self.items = yield api.load();
    });

    return {
      load
    };
  });

export default FeedStore;
