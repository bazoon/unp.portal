import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import findInTree from "../../utils/findPostInTree";

const projectGroups = State({
  initial: {
    groups: [],
    group: { participants: [], conversations: [], files: [] },
    posts: []
  },
  setProjectGroup(state, payload) {
    return { ...state, group: payload };
  },
  setGroupPosts(state, payload) {
    return { ...state, posts: payload };
  },
  addProjectGroupLink(state, payload) {
    const { group } = state;
    group.links = group.links || [];
    group.links = [...group.links, payload];
    return { ...state, group: { ...group, links: group.links } };
  },
  addProjectGroupDoc(state, payload) {
    const { group } = state;
    group.docs = group.docs || [];
    group.docs = [...group.docs, ...payload];
    return { ...state, group: { ...group, docs: group.docs } };
  },
  addProjectGroupMedia(state, payload) {
    const { group } = state;
    group.media = group.media || [];
    group.media = [...group.media, ...payload];
    return { ...state, group: { ...group, media: group.media } };
  },
  addGroupPost(state, { id, post }) {
    let { posts } = state;

    if (!post.parentId) {
      posts = [...posts, post];
    } else {
      const parent = findInTree(posts, post);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(post);
      }
    }
    return { ...state, posts: [...posts] };
  },
  removeProjectGroupLink(state, linkId) {
    const { group } = state;
    const { links } = group;
    const newLinks = links.filter(l => l.id !== linkId);
    return { ...state, group: { ...group, links: newLinks } };
  },
  removeProjectGroupDoc(state, docId) {
    const { group } = state;
    const { docs } = group;
    const newDocs = docs.filter(l => l.id !== docId);
    return { ...state, group: { ...group, docs: newDocs } };
  },
  removeProjectGroupMedia(state, linkId) {
    const { group } = state;
    const { media } = group;
    const newMedia = media.filter(l => l.id !== linkId);
    return { ...state, group: { ...group, media: newMedia } };
  },
  addConversation(state, conversation) {
    const conversations = [...state.group.conversations, conversation];
    return {
      ...state,
      group: { ...state.group, conversations: [...conversations] }
    };
  }
});

Effect("getProjectGroup", ({ id }) => {
  return api.get("api/projectGroups/get", { id }).then(response => {
    return Actions.setProjectGroup(response.data);
  });
});

Effect("postProjectGroupLink", ({ link, title, id }) => {
  return api
    .post("api/projectGroups/links/post", { link, title, id })
    .then(response => {
      return Actions.addProjectGroupLink(response.data);
    });
});

Effect("postProjectGroupDoc", ({ formData }) => {
  return api.post("api/projectGroups/docs/post", formData).then(response => {
    return Actions.addProjectGroupDoc(response.data);
  });
});

Effect("postRemoveProjectGroupLink", id => {
  return api.post("api/projectGroups/links/remove", { id }).then(() => {
    return Actions.removeProjectGroupLink(id);
  });
});

Effect("postProjectGroupMedia", ({ formData }) => {
  return api.post("api/projectGroups/media/post", formData).then(response => {
    return Actions.addProjectGroupMedia(response.data);
  });
});

Effect("postRemoveProjectGroupDoc", id => {
  return api.post("api/projectGroups/docs/remove", { id }).then(() => {
    return Actions.removeProjectGroupDoc(id);
  });
});

Effect("postRemoveProjectGroupMedia", id => {
  return api.post("api/projectGroups/media/remove", { id }).then(() => {
    return Actions.removeProjectGroupMedia(id);
  });
});

Effect("postUnsubscribeGroup", ({ groupId, userId }) => {
  api
    .post("api/ProjectGroups/unsubscribe", {
      groupId,
      userId
    })
    .then(() => {
      Actions.getProjectGroup({ id: groupId, userId });
    });
});

Effect("postSubscribeGroup", ({ groupId, userId }) => {
  api
    .post("api/ProjectGroups/subscribe", {
      groupId,
      userId
    })
    .then(() => {
      Actions.getProjectGroup({ id: groupId, userId });
    });
});

Effect("getOwnGroupPosts", id => {
  return api.get("api/projectGroups/get/posts", { id }).then(response => {
    return Actions.setGroupPosts(response.data);
  });
});

Effect("sendGroupPost", ({ id, formData }) => {
  return api.post("api/projectGroups/post/post", formData).then(response => {
    return Actions.addGroupPost({
      id,
      post: response.data
    });
  });
});

Effect("postCreateConversation", payload => {
  return api
    .post("api/projectGroups/conversation/create", payload)
    .then(response => {
      Actions.addConversation(response.data);
    });
});

Effect("postUpdateBackground", payload => {
  return api.post("api/projectGroups/backgrounds/update", payload).then(() => {
    Actions.getProjectGroup({ id: payload.groupId });
  });
});

export default projectGroups;
