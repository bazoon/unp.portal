import React, { Component } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

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
        <Menu.Item key="/allgroups">
          <Link to="/allgroups">
            <span>Группы</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="/events/my">
          <Link to="/events/my">
            <span>События</span>
          </Link>
        </Menu.Item>
        <Menu.Item key="/conversations">
          <Link to="/conversations">
            <span>Мои обсуждения</span>
          </Link>
        </Menu.Item>
      </Menu>
    );
  }
}

export default MainMenu;
