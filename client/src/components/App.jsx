import React, { Component } from "react";
import { HashRouter } from "react-router-dom";
import Layout from "./Layout";
import LoginForm from "./LoginForm/LoginForm";
import utils from "../utils";
import "moment/locale/ru";
import { observer, inject } from "mobx-react";

import "../../fonts/opensans/opensans.woff2";
import "../../fonts/opensans/opensansbold.woff2";
import "../../fonts/opensans/opensanssemibold.woff2";
import { addMiddleware } from "mobx-state-tree";

@inject("notificationsStore")
@inject("currentUserStore")
@inject("eventsStore")
@observer
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.eventsStore.loadAll();
    this.props.notificationsStore.load();

    this.removeMiddlware = addMiddleware(
      // Если произошел релогин то перезагружаем данные пользователя
      this.props.currentUserStore,
      (call, next) => {
        if (call.name === "setData") {
          this.props.eventsStore.loadAll();
          this.props.notificationsStore.load();
        }

        next(call);
      }
    );
  }

  componentWillUnmount() {
    this.removeMiddlware();
  }

  handleLogin = () => {
    this.setState({});
  };

  handleLogout = () => {
    this.props.currentUserStore.logout();
  };

  render() {
    return (
      <HashRouter>
        <div>
          <Layout onLogout={this.handleLogout} />

          <LoginForm
            isLoggedIn={!!this.props.currentUserStore.token}
            onLogin={this.handleLogin}
          />
        </div>
      </HashRouter>
    );
  }
}

export default App;
