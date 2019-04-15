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
        defaultOpenKeys={["sub1"]}
      >
        <SubMenu key="sub1" title="Группы">
          <Menu.Item key="/mygroups">
            <Link to="/mygroups">Мои группы</Link>
          </Menu.Item>

          <Menu.Item key="/createdgroups">
            <Link to="/createdgroups">Созданные мной</Link>
          </Menu.Item>
          <Menu.Item key="/allgroups">
            <Link to="/allgroups">Все группы</Link>
          </Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" title="События">
          <Menu.Item key="4">
            <Link to="/events/my">Мои события</Link>
          </Menu.Item>
          <Menu.Item key="5">Созданные мной</Menu.Item>
          <Menu.Item key="6">Все события</Menu.Item>
        </SubMenu>
        <Menu.Item key="/laws">
          <Link to="/laws">Нормативная база</Link>
        </Menu.Item>
      </Menu>
    );
  }
}

export default MainMenu;
