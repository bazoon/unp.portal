import React, { Component } from "react";
import { Route, Link, Switch, BrowserRouter } from "react-router-dom";
import { connect } from "react-redux";
import { Layout, Icon, Input, Badge, Popover, Row, Col } from "antd";

import MainMenu from "./MainMenu/MainMenu";
import RightMenu from "./RightMenu/RightMenu";
import ProjectGroups from "./ProjectGroups/ProjectGroups";
import UserProfile from "./UserProfile/UserProfile";
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
import GroupFeed from "./Group/GroupFeed";
import { Actions } from "jumpstate";
import UserLayout from "./UserLayout";
import AdminLayout from "./AdminLayout";

const { Header, Sider, Content } = Layout;

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
    Actions.getPreferences(localStorage.getItem("userId"));
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
    const { userId, userName, avatar } = this.props.profile;
    const { isAdmin } = this.props.login;
    return (
      <BrowserRouter>
        <div className="outer-container">
          <div className="container">
            <Row gutter={27}>
              <Col span={24}>
                <ChatIcon onClick={this.handleChatClick} />
                <Chat visible={isChatOpen} onClose={this.handleChatClose} />
                <Header className="header">
                  <img
                    className="header__logo"
                    src={`${logo.slice(1)}`}
                    alt="Logo"
                  />

                  <div className="main-menu">
                    <Route
                      path="/"
                      component={props => <MainMenu {...props} />}
                    />
                  </div>

                  <div className="header-icons">
                    <Link to="/profile" style={{ display: "flex" }}>
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
                    <div className="header__user">
                      <div>
                        <Popover
                          placement="bottom"
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
                          <Icon style={{ cursor: "pointer" }} type="down" />
                        </Popover>
                      </div>
                    </div>
                  </div>
                </Header>
              </Col>
            </Row>

            <Switch>
              <Route path="/admin" component={AdminLayout} />
              <Route path="/" component={UserLayout} />
            </Switch>
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = state => {
  return {
    login: state.Login,
    profile: state.UserProfilePreferences.profile
  };
};

export default connect(mapStateToProps)(L);
