import { types, flow } from "mobx-state-tree";
import File from "./models/File";
import api from "../api/docs";

const DocumentsStore = types
  .model("DocumentsStore", {
    documents: types.array(File)
  })
  .actions(self => {
    const loadAll = flow(function* loadAll() {
      const documents = yield api.loadAll();
      if (documents) {
        self.documents = documents;
      }
    });

    const search = flow(function* search(value) {
      if (!value) return self.loadAll();
      const documents = yield api.search(value);
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

    const deleteFile = flow(function* deleteFile(id) {
      yield api.deleteFile(id);
      self.documents = self.documents.filter(d => d.id !== id);
    });

    return {
      loadAll,
      search,
      upload,
      push,
      deleteFile
    };
  });

export default DocumentsStore;
