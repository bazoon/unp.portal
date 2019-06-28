import React, { Component } from "react";
import { Route, Link, Switch, BrowserRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Layout, Icon, Input, Badge, Popover, Row, Col } from "antd";
import MainMenu from "./MainMenu/MainMenu";
import ProjectGroups from "./ProjectGroups/ProjectGroups";
import Group from "./Group/Group";
import Feed from "./Feed/Feed";
import Laws from "./Laws/Laws";
import "antd/dist/antd.less";
import "../favicon.ico";
import "./App.less";
import Conversation from "./Conversation/Conversation";
import EventList from "./Events/EventList";
import GroupFeed from "./Group/GroupFeed";
import Documents from "./Documents/Documents";
import Participants from "./Group/Participants/Participants";
import Notifications from "./Notifications/Notifications";
import EditEventForm from "./Events/EditEventForm";

const { Sider, Content } = Layout;

class UserLayout extends Component {
  render() {
    return (
      <Row gutter={27}>
        <Col span={24}>
          <Switch>
            <Route
              exact
              path="/groups"
              component={() => <ProjectGroups type="all" />}
            />

            <Route
              exact
              path="/groups/:id/conversations/:conversationId"
              component={props => (
                <>
                  <Conversation {...props} />
                </>
              )}
            />
            <Route
              path="/groups/:id/participants"
              component={props => <Participants {...props} />}
            />
            <Route
              path="/groups/:id"
              component={props => <GroupFeed {...props} />}
            />
            <Route
              path="/docs/"
              component={props => <Documents {...props} />}
            />

            <Route
              path="/notifications/"
              component={props => <Notifications {...props} />}
            />

            <Route
              path="/events/my"
              component={props => <EventList {...props} />}
            />

            <Route
              path="/events/edit/:id"
              component={props => <EditEventForm {...props} />}
            />

            <Route path="/" component={() => <Feed />} />
          </Switch>
        </Col>
      </Row>
    );
  }
}

export default UserLayout;
