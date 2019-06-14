import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import Menu from "./Admin/Menu";
import Users from "./Admin/Users/Users";
import CreateUserCard from "./Admin/Users/CreateCard";
import EditUserCard from "./Admin/Users/EditCard";
import ViewUserCard from "./Admin/Users/ViewCard";
import "antd/dist/antd.less";
import "../favicon.ico";
import "./App.less";

const { Sider, Content } = Layout;

class AdminLayout extends Component {
  render() {
    console.log(this.props);
    return (
      <Switch>
        <Route path="/admin/users/create" component={CreateUserCard} />
        <Route path="/admin/users/edit/:id" component={EditUserCard} />
        <Route
          path="/admin/users/view/:id"
          component={props => <ViewUserCard {...props} />}
        />
        <Route path="/admin/users" component={props => <Users {...props} />} />
      </Switch>
    );
  }
}

export default AdminLayout;
