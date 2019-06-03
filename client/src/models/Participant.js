import { observable, action } from "mobx";

class Participant {
  @observable id;

  @observable name;

  @observable position;

  @observable roleName;

  @observable level;

  @observable avatar;

  constructor(data) {
    Object.assign(this, data);
  }
}

export default Participant;
