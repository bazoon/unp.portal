import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import { func } from "prop-types";

function findInTree(tree, leaf) {
  for (let i = 0; i < tree.length; i++) {
    let subTree = tree[i];
    if (subTree.id === leaf.parentId) {
      return subTree;
    }
    if (subTree.children && subTree.children.length > 0) {
      const foundLeaf = findInTree(subTree.children, leaf);
      if (foundLeaf) {
        return foundLeaf;
      }
    }
  }
}

const projectGroups = State({
  initial: { conversations: {}, posts: {} },
  setPosts(state, { posts, conversationId }) {
    const conversations = { ...state.conversations };
    conversations[conversationId] = posts;
    return { ...state, conversations };
  },
  addPost(state, { conversationId, post }) {
    const conversations = { ...state.conversations };
    let posts = [...conversations[conversationId]];

    if (!post.parentId) {
      posts = [...posts, post];
    } else {
      const parent = findInTree(posts, post);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(post);
      }
    }

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
