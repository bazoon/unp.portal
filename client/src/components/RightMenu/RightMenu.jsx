import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Input, Icon, Popover, Layout } from "antd";
import Calendar from "../Calendar/Calendar";
import News from "../News/News";
const { Sider } = Layout;

class RightMenu extends Component {
  render() {
    return (
      <Sider width="400" style={{ padding: "10px" }}>
        <Calendar />
        <News />
      </Sider>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    events: state.Events.events
  };
};

export default connect(mapStateToProps)(RightMenu);
