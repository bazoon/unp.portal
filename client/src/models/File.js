import { observable, action } from "mobx";

class File {
  @observable id;

  @observable name;

  @observable url;

  constructor(data) {
    Object.assign(this, data);
  }
}

export default File;
