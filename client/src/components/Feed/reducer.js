import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Feed = State({
  initial: { Feed: [] },
  setGroupPosts(state, payload) {
    return { ...state, posts: payload };
  },
  setRecipients(state, payload) {
    return { ...state, recipients: payload };
  }
});

Effect("getGroupPosts", userId => {
  api.get("api/feed/group_posts", { userId }).then(response => {
    Actions.setGroupPosts(response.data);
  });
});

Effect("getRecipients", userId => {
  api.get("api/feed/recipients", { userId }).then(response => {
    Actions.setRecipients(response.data);
  });
});

Effect("postToFeed", ({ userId, payload }) => {
  return api.post("api/feed/postToFeed", payload).then(response => {
    return Actions.getGroupPosts(userId);
  });
});

Effect("postReplyToFeed", ({ userId, payload }) => {
  api.post("api/feed/postReplyToFeed", payload).then(response => {
    // Actions.setRecipients(response.data);
    Actions.getGroupPosts(userId);
  });
});

export default Feed;
