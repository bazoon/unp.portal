import { observable } from "mobx";

class File {
  @observable id;

  @observable name;

  @observable url;

  @observable size;

  constructor(data) {
    Object.assign(this, data);
  }
}

export default File;
