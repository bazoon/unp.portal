import React, { Component } from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const { SubMenu } = Menu;

export class MainMenu extends Component {
  render() {
    return (
      <Menu theme="white" mode="inline" defaultOpenKeys={["sub1"]}>
        <SubMenu key="sub1" title="Группы">
          <Menu.Item key="1">
            <Link to="/mygroups">Мои группы</Link>
          </Menu.Item>

          <Menu.Item key="2">
            <Link to="/mygroups">Созданные мной</Link>
          </Menu.Item>
          <Menu.Item key="3">Все группы</Menu.Item>
        </SubMenu>
        <SubMenu key="sub2" title="События">
          <Menu.Item key="4">Мои события</Menu.Item>
          <Menu.Item key="5">Созданные мной</Menu.Item>
          <Menu.Item key="6">Все события</Menu.Item>
        </SubMenu>
        <Menu.Item key="sub3">
          <Link to="/laws">Нормативная база</Link>
        </Menu.Item>
      </Menu>
    );
  }
}

export default MainMenu;
