import React, { Component } from "react";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import GroupsIcon from "../../../images/card_view";
import MessagesIcon from "../../../images/chat_wait";
import DocIcon from "../../../images/document";
import EventsIcon from "../../../images/events";
import UserIcon from "../../../images/user";
import NotifyIcon from "../../../images/chat_wait";
import { observer, inject } from "mobx-react";

const { SubMenu } = Menu;

@inject("currentUserStore")
@observer
class MainMenu extends Component {
  render() {
    const { location } = this.props;
    const { pathname } = location;
    const { isAdmin } = this.props.currentUserStore;

    return (
      <Menu
        activeKey={pathname}
        selectedKeys={[pathname]}
        theme="white"
        mode="horizontal"
      >
        <Menu.Item key="/groups">
          <NavLink to="/groups" activeClassName="active">
            <div className="main-menu__item">
              <GroupsIcon />
              Группы
            </div>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="/events">
          <NavLink to="/events">
            <div className="main-menu__item">
              <EventsIcon />
              <span>События</span>
            </div>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="/docs">
          <NavLink to="/docs">
            <div className="main-menu__item">
              <DocIcon />
              Документы
            </div>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="/notifications">
          <NavLink to="/notifications">
            <div className="main-menu__item">
              <NotifyIcon />
              <span>Уведомления</span>
            </div>
          </NavLink>
        </Menu.Item>

        {isAdmin && (
          <Menu.Item key="/admin/users">
            <NavLink to="/admin/users">
              <div className="main-menu__item">
                <UserIcon />
                <span>Пользователи</span>
              </div>
            </NavLink>
          </Menu.Item>
        )}
      </Menu>
    );
  }
}

const mapStateToProps = state => {
  return {
    login: state.Login
  };
};

export default connect(mapStateToProps)(MainMenu);
