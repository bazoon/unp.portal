import { types, onSnapshot } from "mobx-state-tree";
import Post from "./Post";
import File from "./File";

const Conversation = types.model("Conversation", {
  id: types.identifierNumber,
  name: types.maybeNull(types.string),
  count: types.number,
  createdAt: types.string,
  description: types.string,
  isCommentable: types.boolean,
  isPinned: types.boolean,
  title: types.string,
  files: types.array(File),
  postsTree: types.array(Post)
});

export default Conversation;
