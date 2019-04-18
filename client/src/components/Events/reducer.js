import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Feed = State({
  initial: { events: [], allEvents: [] },
  setEvents(state, payload) {
    return { ...state, events: payload };
  },
  setAllEvents(state, payload) {
    return { ...state, allEvents: payload };
  },
  createEvent(state, payload) {
    return { ...state, events: [...state.events, payload] };
  }
});

Effect("postCreateEvent", ({ payload, userId }) => {
  api.post("api/events/create", payload).then(() => {
    const now = new Date();
    Actions.getEvents({ now, userId });
    Actions.getAllEvents({ now, userId });
  });
});

Effect("getEvents", payload => {
  api.get("api/events/list", payload).then(response => {
    Actions.setEvents(response.data);
  });
});

Effect("getAllEvents", payload => {
  api.get("api/events/list/all", payload).then(response => {
    Actions.setAllEvents(response.data);
  });
});

export default Feed;
