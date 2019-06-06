import { types, onSnapshot } from "mobx-state-tree";
import File from "./File";

const Post = types.model("Post", {
  id: types.identifierNumber,
  avatar: types.string,
  children: types.array(types.late(() => Post)),
  createdAt: types.string,
  files: types.array(File),
  parentId: types.maybeNull(types.number),
  position: types.string,
  text: types.string,
  userName: types.string
});

export default Post;
