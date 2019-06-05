import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { LocaleProvider } from "antd";
import ruRU from "antd/lib/locale-provider/ru_RU";
import App from "./components/App";
import store from "./store";
import projectGroups from "./stores/projectGroups";
import currentUser from "./stores/currentUser";
import documents from "./stores/documents";
import groupsStore from "./mst/GroupsStore";
import { Provider as MobxProvider } from "mobx-react";

import { onPatch } from "mobx-state-tree";
const g = groupsStore.create();

window.g = g;
onPatch(
  g,
  (patch, inversePatch) => {
    // patches.push({ patch, inversePatch });
  },
  true // true indicates we want revertible patches. For server communication: use `false` here, standard patches are smaller
);

ReactDOM.render(
  <MobxProvider
    projectGroups={projectGroups}
    currentUser={currentUser}
    documents={documents}
    groupsStore={g}
  >
    <Provider store={store}>
      <LocaleProvider locale={ruRU}>
        <App />
      </LocaleProvider>
    </Provider>
  </MobxProvider>,
  document.getElementById("app")
);
