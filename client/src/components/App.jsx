import React, { Component } from "react";
import { HashRouter } from "react-router-dom";
import Layout from "./Layout";
import LoginForm from "./LoginForm/LoginForm";
import utils from "../utils";
import { Actions } from "jumpstate";
import "moment/locale/ru";
import { observer, inject } from "mobx-react";

import "../../fonts/opensans/opensans.woff2";
import "../../fonts/opensans/opensansbold.woff2";
import "../../fonts/opensans/opensanssemibold.woff2";

@inject("currentUser")
@observer
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLogin = () => {
    this.setState({});
  };

  handleLogout = () => {
    this.props.currentUser.logout();
  };

  render() {
    return (
      <HashRouter>
        {this.props.currentUser.token ? (
          <Layout onLogout={this.handleLogout} />
        ) : (
          <LoginForm onLogin={this.handleLogin} />
        )}
      </HashRouter>
    );
  }
}

export default App;
