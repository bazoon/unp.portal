import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Laws = State({
  initial: { laws: [] },
  setLaws(state, payload) {
    return { laws: payload };
  }
});

Effect("getLaws", payload => {
  api.get("api/laws/list").then(response => {
    Actions.setLaws(response.data);
  });
});

export default Laws;
