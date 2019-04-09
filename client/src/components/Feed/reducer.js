import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Feed = State({
  initial: { Feed: [] },
  setGroupPosts(state, payload) {
    return { posts: payload };
  }
});

Effect("getGroupPosts", userId => {
  api.get("api/feed/group_posts", { userId }).then(response => {
    Actions.setGroupPosts(response.data);
  });
});

export default Feed;
