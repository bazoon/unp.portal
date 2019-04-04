import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const projectGroups = State({
  initial: { conversations: {}, posts: {} },
  setPosts(state, { posts, conversationId }) {
    const conversations = { ...state.conversations };
    conversations[conversationId] = posts;
    return { ...state, conversations };
  },
  addPost(state, { conversationId, post }) {
    const conversations = { ...state.conversations };
    const posts = [...conversations[conversationId], post];
    conversations[conversationId] = posts;
    return { ...state, conversations };
  },
  addReply(state, { postId, comment }) {
    const posts = { ...state.posts };
    const comments = (posts[postId] || []).concat([comment]);
    posts[postId] = comments;
    return { ...state, posts };
  },
  setComments(state, { comments, postId }) {
    const posts = { ...state.posts };
    posts[postId] = [...comments];

    return { ...state, posts };
  }
});

Effect("getConversation", conversationId => {
  api.get("api/conversations/get", { id: conversationId }).then(response => {
    Actions.setPosts({ posts: response.data, conversationId });
  });
});

Effect("sendConversationPost", ({ conversationId, formData }) => {
  return api.post("api/conversations/post", formData).then(response => {
    return Actions.addPost({
      conversationId,
      post: response.data
    });
  });
});

Effect("getComments", postId => {
  api.get("api/comments/get", { id: postId }).then(response => {
    Actions.setComments({ comments: response.data, postId });
  });
});

Effect("sendPostReply", ({ postId, formData }) => {
  return api.post("api/comments/post", formData).then(response => {
    return Actions.addReply({
      postId,
      comment: response.data
    });
  });
});

export default projectGroups;
