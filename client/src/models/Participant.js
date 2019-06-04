import { observable, action } from "mobx";

class Participant {
  @observable id;

  @observable name;

  @observable position;

  @observable roleName;

  @observable level;

  @observable avatar;

  @observable isAdmin;

  @observable userId;

  constructor(data) {
    Object.assign(this, data);
  }

  clone() {
    return new Participant({
      id: this.id,
      name: this.name,
      position: this.position,
      level: this.level,
      avatar: this.avatar,
      isAdmin: this.isAdmin,
      userId: this.userId
    });
  }
}

export default Participant;
