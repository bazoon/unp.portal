import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { Layout } from "antd";
import Menu from "./Admin/Menu";
import Users from "./Admin/Users/Users";
import CreateUserCard from "./Admin/Users/CreateCard";
import EditUserCard from "./Admin/Users/EditCard";
import "antd/dist/antd.less";
import "../favicon.ico";
import "./App.less";

const { Sider, Content } = Layout;

class AdminLayout extends Component {
  render() {
    return (
      <Layout>
        <Sider>
          <div className="main-menu">
            <Route path="/" component={Menu} />
          </div>
        </Sider>
        <Content>
          <Switch>
            <Route path="/admin/users/create" component={CreateUserCard} />
            <Route path="/admin/users/edit/:id" component={EditUserCard} />
            <Route path="/admin/users" component={Users} />
          </Switch>
        </Content>
      </Layout>
    );
  }
}

export default AdminLayout;
