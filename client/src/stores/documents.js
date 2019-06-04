import { observable } from "mobx";
import api from "../api/docs";
import File from "../models/File";

class Documents {
  @observable documents = [];

  constructor(docsApi) {
    this.api = docsApi;
  }

  load() {
    this.api.loadAll().then(data => {
      this.documents = data.map(f => new File(f));
    });
  }

  upload(payload) {
    return this.api.upload(payload).then(() => {
      this.load();
    });
  }
}

export default new Documents(api);
