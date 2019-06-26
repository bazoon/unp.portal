import React, { Component } from "react";
import "./Notifications.less";
import { observer, inject } from "mobx-react";
import { Row, Col, Table, Popover, Badge } from "antd";
import Calendar from "../Calendar/Calendar";
import NotificationsList from "./NotificationsList";
import { Link } from "react-router-dom";
import BellIcon from "../../../images/bell";

@inject("notificationsStore")
@observer
class TopNotifications extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  clikOutsideListener = e => {
    const { target } = e;
    const popover = target.closest(".ant-popover");
    if (!popover) {
      this.setState({
        visible: false
      });
    }
  };

  componentDidMount() {
    document.body.addEventListener("click", this.clikOutsideListener);
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.clikOutsideListener);
  }

  handleSaw = id => {
    this.props.notificationsStore.markAsSeen(id);
  };

  handleMarkAllAsSeen = () => {
    this.setState({
      visible: false
    });

    this.props.notificationsStore.markAllAsSeen();
  };

  handleClick = () => {
    this.setState({
      visible: true
    });
  };

  renderContent() {
    const unseen = this.props.notificationsStore.unseen.slice(0, 5);

    return (
      <>
        <div style={{ maxWidth: "300px" }}>
          <NotificationsList
            onSaw={this.handleSaw}
            pagination={false}
            notifications={unseen}
          />
        </div>
        <div className="top-notification__view-all">
          <Link to="/notifications" onClick={this.handleMarkAllAsSeen}>
            Посмотреть все
          </Link>
        </div>
      </>
    );
  }

  render() {
    return (
      <Popover
        visible={this.state.visible}
        placement="bottom"
        content={this.renderContent()}
        trigger="click"
      >
        <Badge
          count={this.props.notificationsStore.unseen.length}
          className="notification-badge"
          onClick={this.handleClick}
        >
          <BellIcon />
        </Badge>
      </Popover>
    );
  }
}

export default TopNotifications;
