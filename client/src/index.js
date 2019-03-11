import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { LocaleProvider } from "antd";
import ruRU from "antd/lib/locale-provider/ru_RU";
import App from "./components/App";
import store from "./store";

ReactDOM.render(
  <Provider store={store}>
    <LocaleProvider locale={ruRU}>
      <App />
    </LocaleProvider>
  </Provider>,
  document.getElementById("app")
);
