import { types, flow } from "mobx-state-tree";
import File from "./models/File";
import api from "../api/docs";

const DocumentsStore = types
  .model("DocumentsStore", {
    documents: types.array(File)
  })
  .views(self => {
    function getAll() {
      return self.documents;
    }

    return {
      getAll
    };
  })
  .actions(self => {
    const loadAll = flow(function* loadAll() {
      const documents = yield api.loadAll();
      if (documents) {
        self.documents = documents;
      }
    });

    const upload = flow(function* upload(payload) {
      yield api.upload(payload);
      self.loadAll();
    });

    function push(f) {
      self.documents.push(f);
    }

    return {
      loadAll,
      upload,
      push
    };
  });

export default DocumentsStore;
