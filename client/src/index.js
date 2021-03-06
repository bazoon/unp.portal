import React from "react";
import ReactDOM from "react-dom";
import "@babel/polyfill";
import { Provider as MobxProvider } from "mobx-react";
import { ConfigProvider } from "antd";
// import ruRU from "antd/lib/locale-provider/ru_RU";
import ruRU from 'antd/es/locale/ru_RU';
import App from "./components/App";
import GroupsStore from "./mst/GroupsStore";
import DocumentsStore from "./mst/DocumentsStore";
import currentUserStore from "./mst/CurrentUserStore";
import FeedStore from "./mst/FeedStore";
import EventsStore from "./mst/EventsStore";
import UsersStore from "./mst/UsersStore";
import OrganizationsStore from "./mst/OrganizationsStore";
import PositionsStore from "./mst/PositionsStore";
import NotificationsStore from "./mst/NotificationsStore";
import ChatStore from "./mst/ChatStore";

const groupsStore = GroupsStore.create();
const documentsStore = DocumentsStore.create();
const feedStore = FeedStore.create();
const eventsStore = EventsStore.create();
const usersStore = UsersStore.create();
const organizationsStore = OrganizationsStore.create();
const positionsStore = PositionsStore.create();
const notificationsStore = NotificationsStore.create();
const chatStore = ChatStore.create();

chatStore.setCurrentUserStore(currentUserStore);
usersStore.setCurrentUserStore(currentUserStore);

ReactDOM.render(
  <MobxProvider
    groupsStore={groupsStore}
    documentsStore={documentsStore}
    currentUserStore={currentUserStore}
    feedStore={feedStore}
    eventsStore={eventsStore}
    usersStore={usersStore}
    organizationsStore={organizationsStore}
    positionsStore={positionsStore}
    notificationsStore={notificationsStore}
    chatStore={chatStore}
  >
    <ConfigProvider locale={ruRU}>
      <App />
    </ConfigProvider>
  </MobxProvider>,
  document.getElementById("app")
);
