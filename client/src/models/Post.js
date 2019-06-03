import { observable, action } from "mobx";

class Post {
  @observable id;

  @observable avatar;

  @observable children;

  @observable files;

  @observable parentId;

  @observable position;

  @observable text;

  @observable userName;

  constructor(data) {
    Object.assign(this, data);
  }
}

export default Post;
