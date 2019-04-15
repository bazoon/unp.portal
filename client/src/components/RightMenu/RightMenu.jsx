import React, { Component } from "react";
import { connect } from "react-redux";
import { Button, Input, Icon, Popover } from "antd";
import Calendar from "../Calendar/Calendar";
import News from "../News/News";

class RightMenu extends Component {
  render() {
    return (
      <React.Fragment>
        <Calendar />
        <News />
      </React.Fragment>
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
