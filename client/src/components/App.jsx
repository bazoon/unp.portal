import React, { Component } from "react";
import { connect } from "react-redux";
import { HashRouter } from "react-router-dom";
import Layout from "./Layout";
import LoginForm from "./LoginForm/LoginForm";
import utils from "../utils";
import { Actions } from "jumpstate";
import client from "./client";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleLogin = () => {
    this.setState({});
  };

  handleLogout = () => {
    Actions.logout();
  };

  render() {
    const isLoggedIn = this.props.login.token != undefined;

    return (
      <HashRouter>
        {isLoggedIn ? (
          <Layout onLogout={this.handleLogout} />
        ) : (
          <LoginForm onLogin={this.handleLogin} />
        )}
      </HashRouter>
    );
  }
}

const mapStateToProps = state => {
  return { login: state.Login };
};

export default connect(mapStateToProps)(App);
