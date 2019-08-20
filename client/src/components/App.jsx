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
@inject("groupsStore")
@inject("chatStore")
@inject("usersStore")
@observer
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.currentUserStore.getCurrent();
    this.props.eventsStore.loadAll();
    this.props.eventsStore.loadUpcoming();
    this.props.notificationsStore.load();

    this.removeMiddlware = addMiddleware(
      // Если произошел релогин то перезагружаем данные пользователя
      this.props.currentUserStore,
      (call, next) => {
        if (call.name === "setData") {
          this.props.eventsStore.loadAll();
          this.props.notificationsStore.load();
          this.props.chatStore.getChannels();
          this.props.groupsStore.loadGroups();
          this.props.usersStore.loadAllUsers();
          this.props.chatStore.connectSocket();
          this.props.eventsStore.loadUpcoming();

          // HACK
          // чтобы избежать проблем с перезагрузкой данных некоторых
          // страниц. Хорошо бы сделать чтобы эти данные подгружались
          // каким-то единообразным способом. ComponentDidMount при релогине
          // не срабатывает поэтому нужно искать иной способ.
          // window.location = "/";
        } else if (call.name === "logout") {
          this.props.chatStore.disconnectSocket();
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
    const isLoggedIn = !!this.props.currentUserStore.token;
    if (!isLoggedIn) {
      return (
        <LoginForm
          isLoggedIn={!!this.props.currentUserStore.token}
          onLogin={this.handleLogin}
        />
      );
    }

    return (
      <HashRouter>
        <Layout onLogout={this.handleLogout} />
      </HashRouter>
    );
  }
}

export default App;
