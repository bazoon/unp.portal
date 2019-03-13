import React, { Component } from "react";
import { Route, Link, Switch } from "react-router-dom";
import { Layout, Icon, Input, Badge, Popover } from "antd";
import { MainMenu } from "./MainMenu/MainMenu";
import { RightMenu } from "./RightMenu/RightMenu";
import ProjectGroups from "./ProjectGroups/ProjectGroups";
import { UserProfile } from "./UserProfile/UserProfile";
import { Group } from "./Group/Group";
import { GroupSidebar } from "./Group/GroupSidebar";
import Feed from "./Feed/Feed";
import Laws from "./Laws/Laws";
import ChatIcon from "./Chat/ChatIcon";
import Chat from "./Chat/Chat";

import "antd/dist/antd.less";
import logo from "./top-logo.svg";
import "../favicon.ico";
import "./App.less";
import Notifications from "./Notifications/Notifications";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

class L extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChatOpen: false
    };
  }

  handleChatClick = () => {
    this.setState({
      isChatOpen: true
    });
  };

  handleChatClose = () => {
    this.setState({
      isChatOpen: false
    });
  };

  render() {
    const { isChatOpen } = this.state;
    return (
      <Layout>
        <ChatIcon onClick={this.handleChatClick} />
        <Chat visible={isChatOpen} onClose={this.handleChatClose} />
        <Header className="header">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
          <div className="header__search-container">
            <Search className="header__search-input" />
          </div>
          <div className="header__support">
            <Icon type="phone" className="icon__medium" />
            <div>
              Техническая поддержка
              <br />
              0000-000-000-000
            </div>
          </div>
          <Popover
            title="Уведомления"
            className="notifications__popover"
            content={<Notifications />}
            trigger="click"
          >
            <div className="header__notification">
              <Badge count={5}>
                <Icon type="bell" className="icon__medium" />
              </Badge>
            </div>
          </Popover>
          <div className="header__user">
            <div>
              Соколова Виктория
              <br />
              СНИЛС 000-0000-000
            </div>
            <Link to="/profile">
              <Icon type="user" className="icon__medium" />
            </Link>
          </div>
        </Header>
        <Layout>
          <Sider>
            <Route path="/" component={MainMenu} />
          </Sider>
          <Content>
            <Switch>
              <Route
                path="/mygroups"
                component={() => <ProjectGroups type="my" />}
              />
              <Route
                path="/createdgroups"
                component={() => <ProjectGroups type="created" />}
              />
              <Route
                path="/allgroups"
                component={() => <ProjectGroups type="all" />}
              />
              <Route path="/profile" component={() => <UserProfile />} />
              <Route
                path="/group"
                component={() => (
                  <>
                    <Group />
                    <Feed />
                  </>
                )}
              />
              <Route path="/laws" component={() => <Laws />} />
              <Route path="/" component={Feed} />
            </Switch>
          </Content>
          <Sider width="300" style={{ padding: "10px" }}>
            <Switch>
              <Route path="/group/:id" component={GroupSidebar} />
              <Route path="/" component={RightMenu} />
            </Switch>
          </Sider>
        </Layout>
      </Layout>
    );
  }
}

export default L;
