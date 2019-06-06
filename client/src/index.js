import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { LocaleProvider } from "antd";
import ruRU from "antd/lib/locale-provider/ru_RU";
import App from "./components/App";
import store from "./store";
import currentUser from "./stores/currentUser";
import GroupsStore from "./mst/GroupsStore";
import { Provider as MobxProvider } from "mobx-react";
import DocumentsStore from "./mst/DocumentsStore";
import { onPatch } from "mobx-state-tree";

const groupsStore = GroupsStore.create();
const documentsStore = DocumentsStore.create();

ReactDOM.render(
  <MobxProvider
    currentUser={currentUser}
    groupsStore={groupsStore}
    documentsStore={documentsStore}
  >
    <Provider store={store}>
      <LocaleProvider locale={ruRU}>
        <App />
      </LocaleProvider>
    </Provider>
  </MobxProvider>,
  document.getElementById("app")
);
