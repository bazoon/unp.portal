import React, { Component } from "react";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";
import { connect } from "react-redux";

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
        {isAdmin && (
          <Menu.Item key="/admin">
            <NavLink to="/admin/users">
              <span>Админ</span>
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
