import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const News = State({
  initial: { news: [] },
  setNews(state, payload) {
    return { news: payload };
  }
});

Effect("getNews", payload => {
  api.get("api/news/list").then(response => {
    Actions.setNews(response.data);
  });
});

export default News;
