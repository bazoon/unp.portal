import { observable, action } from "mobx";
import Post from "./Post";

function mapTree(tree, fn) {
  return tree.map(item => {
    if (item.children.length > 0) {
      item.children = mapTree(item.children, fn);
    }
    return fn(item);
  });
}

class Conversation {
  @observable id;

  @observable name;

  @observable count;

  @observable createdAt;

  @observable description;

  @observable isCommentable;

  @observable isPinned;

  @observable title;

  @observable postsTree = [];

  constructor(data) {
    Object.assign(this, data);
    if (data.postsTree && data.postsTree.length > 0) {
      this.postsTree = mapTree(data.postsTree, item => new Post(item));
    }
  }
}

export default Conversation;
