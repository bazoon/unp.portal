import React, { Component } from "react";
import { Route, Link, Switch, BrowserRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Layout, Icon, Input, Badge, Popover, Row, Col } from "antd";
import MainMenu from "./MainMenu/MainMenu";
import RightMenu from "./RightMenu/RightMenu";
import ProjectGroups from "./ProjectGroups/ProjectGroups";
import UserProfile from "./UserProfile/UserProfile";
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

            <Route path="/profile" component={() => <UserProfile />} />
            <Route
              exact
              path="/groups/:id/conversation/:conversationId"
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

            <Route path="/events/my" component={EventList} />
            <Route path="/" component={Feed} />
          </Switch>
        </Col>
        {/* <Col span={8}>
            <Switch>
              <Route
                exact
                path="/groups/:id"
                component={props => (
                  <>
                    <Group {...props} />
                  </>
                )}
              />
              <Route path="/groups" component={null} />
              <Route
                exact
                path="/"
                component={props => <RightMenu {...props} />}
              />
            </Switch>
          </Col> */}
      </Row>
    );
  }
}

export default UserLayout;
