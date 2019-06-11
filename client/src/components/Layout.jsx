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
import Logo from "../../images/logo";
import ColorLogo from "../../images/top-logo";
import PhoneIcon from "../../images/phone";

const { Header, Sider, Footer } = Layout;

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
      <>
        {isChatOpen && (
          <Chat visible={isChatOpen} onClose={this.handleChatClose} />
        )}
        <BrowserRouter>
          <div className="outer-container">
            <ChatIcon onClick={this.handleChatClick} />
            <Header className="header">
              <div className="container">
                <div className="header__container">
                  <div className="logo-wrap">
                    <Link to="/">
                      <ColorLogo />
                    </Link>

                    <div className="logo-text-wrap">
                      <div className="logo-text-main">Электронный бюджет</div>
                      <div className="logo-text">
                        Управление национальными проектами
                      </div>
                    </div>
                  </div>

                  <div className="main-menu">
                    <Route
                      path="/"
                      component={props => <MainMenu {...props} />}
                    />
                  </div>

                  <div className="header__info">
                    <div className="header__support">
                      <PhoneIcon />
                      <div style={{ marginLeft: "8px" }}>
                        <div className="header__support-text">
                          Техническая поддержка
                        </div>
                        <div className="header__support-phone">
                          8-800-350-02-18
                        </div>
                      </div>
                    </div>

                    <div className="header__icons">
                      <Link
                        to="/profile"
                        style={{ display: "flex", marginRight: "8px" }}
                      >
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
                  </div>
                </div>
              </div>
            </Header>

            <div className="container container_content">
              <Switch>
                <Route path="/admin" component={AdminLayout} />
                <Route path="/" component={UserLayout} />
              </Switch>
            </div>

            <Footer className="footer">
              <div className="container container_footer">
                <div className="logo-wrap">
                  <Logo />
                  <div className="logo-text-wrap">
                    <div className="logo-text-main">Электронный бюджет</div>
                    <div className="logo-text">
                      Управление национальными проектами
                    </div>
                  </div>
                </div>
                <div className="footer__support">
                  <div>
                    <div className="footer__support-text">
                      Техническая поддержка
                    </div>
                    <div className="footer__support-phone">8-800-350-02-18</div>
                  </div>
                </div>
              </div>
            </Footer>
          </div>
        </BrowserRouter>
      </>
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
