import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Users from "./Admin/Users/Users";
import CreateUserCard from "./Admin/Users/CreateCard";
import EditUserCard from "./Admin/Users/EditCard";
import ViewUserCard from "./Admin/Users/ViewCard";
import "antd/dist/antd.less";
import "../favicon.ico";
import "./App.less";

class AdminLayout extends Component {
  render() {
    return (
      <Switch>
        <Route path="/admin/users/create" component={CreateUserCard} />
        <Route path="/admin/users/edit/:id" component={EditUserCard} />
        <Route path="/admin/users/view/:id" component={ViewUserCard} />
        <Route path="/admin/users" component={Users} />
      </Switch>
    );
  }
}

export default AdminLayout;
