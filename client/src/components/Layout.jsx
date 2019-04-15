import React, { Component } from "react";
import { Route, Link, Switch, BrowserRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Layout, Icon, Input, Badge, Popover } from "antd";
import { MainMenu } from "./MainMenu/MainMenu";
import RightMenu from "./RightMenu/RightMenu";
import ProjectGroups from "./ProjectGroups/ProjectGroups";
import { UserProfile } from "./UserProfile/UserProfile";
import Group from "./Group/Group";
import GroupSidebar from "./Group/GroupSidebar";
import Feed from "./Feed/Feed";
import Laws from "./Laws/Laws";
import ChatIcon from "./Chat/ChatIcon";
import Chat from "./Chat/Chat";

import "antd/dist/antd.less";
import logo from "./top-logo.svg";

import "../favicon.ico";
import "./App.less";
import Notifications from "./Notifications/Notifications";
import Conversation from "./Conversation/Conversation";
import EventList from "./Events/EventList";
import { Actions } from "jumpstate";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

class L extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isChatOpen: false
    };
  }

  // Тут загрузка данных общих для разных
  // дочерних компонентов
  componentDidMount() {
    const { userId } = this.props.login;
    Actions.getAllEvents({ userId });
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

  handleLogout = () => {
    this.props.onLogout();
  };

  render() {
    const { isChatOpen } = this.state;
    const { userName, avatar, userId } = this.props.login;
    return (
      <BrowserRouter>
        <Layout>
          <ChatIcon onClick={this.handleChatClick} />
          <Chat visible={isChatOpen} onClose={this.handleChatClose} />
          <Header className="header">
            <Link to="/">
              <img src={`${logo.slice(1)}`} alt="Logo" />
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
                <Popover
                  content={
                    <div
                      style={{ cursor: "pointer" }}
                      onClick={this.handleLogout}
                    >
                      Выйти
                    </div>
                  }
                  trigger="click"
                >
                  <span style={{ cursor: "pointer" }}>{userName}</span>
                </Popover>
                <br />
                СНИЛС 000-0000-000
              </div>
              <Link to="/profile">
                {avatar ? (
                  <img
                    src={avatar}
                    className="header__user-avatar"
                    alt="avatar"
                  />
                ) : (
                  <Icon type="user" className="icon__medium" />
                )}
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
                  path="/group/:id/conversation/:conversationId"
                  component={props => (
                    <>
                      <Conversation {...props} />
                    </>
                  )}
                />
                <Route
                  path="/group/:id"
                  component={props => (
                    <>
                      <Group {...props} />
                      <Feed />
                    </>
                  )}
                />
                <Route path="/laws" component={() => <Laws />} />
                <Route path="/events/my" component={EventList} />
                <Route path="/" component={Feed} />
              </Switch>
            </Content>
            <Sider width="300" style={{ padding: "10px" }}>
              <Switch>
                <Route path="/group/:id" component={GroupSidebar} />
                <Route path="/" component={props => <RightMenu {...props} />} />
              </Switch>
            </Sider>
          </Layout>
        </Layout>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = state => {
  return { login: state.Login };
};

export default connect(mapStateToProps)(L);
