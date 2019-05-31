import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Documents = State({
  initial: { files: [] },
  setDocuments(state, data) {
    return { ...state, files: data };
  }
});

Effect("getDocuments", () => {
  api.get("api/files").then(({ data }) => {
    Actions.setDocuments(data);
  });
});

export default Documents;
