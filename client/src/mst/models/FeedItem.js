import { types, onSnapshot } from "mobx-state-tree";
import Post from "./Post";
import File from "./File";

const FeedItem = types.model("FeedItem", {
  id: types.identifierNumber,
  groupId: types.number,
  userName: types.maybeNull(types.string),
  count: types.string,
  createdAt: types.string,
  description: types.string,
  isCommentable: types.maybeNull(types.boolean),
  title: types.string
});

export default FeedItem;
