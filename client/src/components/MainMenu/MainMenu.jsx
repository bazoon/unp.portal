import React, { Component } from "react";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

const { SubMenu } = Menu;

export class MainMenu extends Component {
  render() {
    const { location } = this.props;
    const { pathname } = location;
    return (
      <Menu
        activeKey={pathname}
        selectedKeys={[pathname]}
        theme="white"
        mode="inline"
        defaultOpenKeys={["sub1", "sub2"]}
      >
        <Menu.Item>
          <NavLink to="/groups" activeClassName="active">
            <span>Группы</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="/events/my">
          <NavLink to="/events/my">
            <span>События</span>
          </NavLink>
        </Menu.Item>
        <Menu.Item key="/conversations">
          <NavLink to="/conversations">
            <span>Мои обсуждения</span>
          </NavLink>
        </Menu.Item>
      </Menu>
    );
  }
}

export default MainMenu;
