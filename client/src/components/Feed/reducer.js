import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Feed = State({
  initial: { Feed: [] },
  setFeed(state, payload) {
    return { feed: payload };
  }
});

Effect("getFeed", payload => {
  api.get("api/feed/list").then(response => {
    Actions.setFeed(response.data);
  });
});

export default Feed;
