import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import findInTree from "../../utils/findPostInTree";

const projectGroups = State({
  initial: { groups: [], group: {}, posts: [] },
  setProjectGroup(state, payload) {
    return { ...state, group: payload };
  },
  setGroupPosts(state, payload) {
    return { ...state, posts: payload };
  },
  unsubscribeGroup(state) {
    const { group } = state;
    group.participant = false;
    group.count -= 1;
    return { ...state, group: { ...group } };
  },
  subscribeGroup(state) {
    const { group } = state;
    group.participant = true;
    group.count += 1;
    return { ...state, group: { ...group } };
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
      posts = [post, ...posts];
    } else {
      const parent = findInTree(posts, post);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.unshift(post);
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
  }
});

Effect("getProjectGroup", ({ id, userId }) => {
  return api.get("api/projectGroups/get", { id, userId }).then(response => {
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
      Actions.unsubscribeGroup();
    });
});

Effect("postSubscribeGroup", ({ groupId, userId }) => {
  api
    .post("api/ProjectGroups/subscribe", {
      groupId,
      userId
    })
    .then(() => {
      Actions.subscribeGroup();
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

export default projectGroups;
