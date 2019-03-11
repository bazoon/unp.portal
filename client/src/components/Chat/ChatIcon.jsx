import React, { Component } from "react";
import { Icon } from "antd";
import "./Chat.less";

class ChatIcon extends Component {
  render() {
    return (
      <div className="chat__icon" onClick={this.props.onClick}>
        <Icon style={{ fontSize: "40px" }} type="wechat" />
      </div>
    );
  }
}

export default ChatIcon;
