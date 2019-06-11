import React, { Component } from "react";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";
import GroupsIcon from "../../../images/card_view";
import MessagesIcon from "../../../images/chat_wait";
import DocIcon from "../../../images/document";

const { SubMenu } = Menu;

class MainMenu extends Component {
  render() {
    const { location } = this.props;
    const { pathname } = location;
    const { isAdmin } = this.props.login;

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
        <Menu.Item key="/messages">
          <NavLink to="/messages">
            <div className="main-menu__item">
              <MessagesIcon />
              Собщения
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
        <Menu.Item key="/events/my">
          <NavLink to="/events/my">
            <span>События</span>
          </NavLink>
        </Menu.Item>

        {isAdmin && (
          <Menu.Item key="/admin/users">
            <NavLink to="/admin/users">
              <span>Пользователи</span>
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
