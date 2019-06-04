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

import { Provider as MobxProvider } from "mobx-react";

ReactDOM.render(
  <MobxProvider
    projectGroups={projectGroups}
    currentUser={currentUser}
    documents={documents}
  >
    <Provider store={store}>
      <LocaleProvider locale={ruRU}>
        <App />
      </LocaleProvider>
    </Provider>
  </MobxProvider>,
  document.getElementById("app")
);
