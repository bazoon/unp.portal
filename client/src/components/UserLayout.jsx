import React, { Component } from "react";
import { Route, Link, Switch, BrowserRouter } from "react-router-dom";
import { Layout, Icon, Input, Badge, Popover, Row, Col } from "antd";
import ProjectGroups from "./ProjectGroups/ProjectGroups";
import Feed from "./Feed/Feed";
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
import Event from "./Events/Event";

class UserLayout extends Component {
  render() {
    return (
      <Row gutter={27}>
        <Col span={24}>
          <Switch>
            <Route exact path="/groups" component={ProjectGroups} />
            <Route
              exact
              path="/groups/:id/conversations/:conversationId"
              component={Conversation}
            />
            <Route path="/groups/:id/participants" component={Participants} />
            <Route path="/groups/:id" component={GroupFeed} />
            <Route path="/docs/" component={Documents} />
            <Route path="/notifications/" component={Notifications} />
            <Route path="/events/edit/:id" component={EditEventForm} />
            <Route path="/events/:id" component={Event} />
            <Route path="/events" component={EventList} />
            <Route path="/" component={Feed} />
          </Switch>
        </Col>
      </Row>
    );
  }
}

export default UserLayout;
