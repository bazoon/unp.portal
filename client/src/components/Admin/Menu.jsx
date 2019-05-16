import React, { Component } from "react";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

export class MainMenu extends Component {
  render() {
    const { location } = this.props;
    const { pathname } = location;
    return (
      <div className="admin-menu">
        <Menu
          activeKey={pathname}
          selectedKeys={[pathname]}
          theme="white"
          mode="inline"
          defaultOpenKeys={["sub1", "sub2"]}
        >
          <Menu.Item>
            <NavLink to="/groups" activeClassName="active">
              <span>Аудит</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="/admin/users">
            <NavLink to="/admin/users">
              <span>Пользователи</span>
            </NavLink>
          </Menu.Item>
          <Menu.Item key="/conversations">
            <NavLink to="/conversations">
              <span>Роли</span>
            </NavLink>
          </Menu.Item>
        </Menu>
      </div>
    );
  }
}

export default MainMenu;
