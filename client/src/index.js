import React from "react";
import ReactDOM from "react-dom";
import "@babel/polyfill";
import { Provider } from "react-redux";
import { Provider as MobxProvider } from "mobx-react";
import { LocaleProvider } from "antd";
import ruRU from "antd/lib/locale-provider/ru_RU";
import App from "./components/App";
import store from "./store";
import GroupsStore from "./mst/GroupsStore";
import DocumentsStore from "./mst/DocumentsStore";
import currentUserStore from "./mst/CurrentUserStore";
import FeedStore from "./mst/FeedStore";
import EventsStore from "./mst/EventsStore";
import UsersStore from "./mst/UsersStore";

const groupsStore = GroupsStore.create();
const documentsStore = DocumentsStore.create();
const feedStore = FeedStore.create();
const eventsStore = EventsStore.create();
const usersStore = UsersStore.create();

ReactDOM.render(
  <MobxProvider
    groupsStore={groupsStore}
    documentsStore={documentsStore}
    currentUserStore={currentUserStore}
    feedStore={feedStore}
    eventsStore={eventsStore}
    usersStore={usersStore}
  >
    <Provider store={store}>
      <LocaleProvider locale={ruRU}>
        <App />
      </LocaleProvider>
    </Provider>
  </MobxProvider>,
  document.getElementById("app")
);
