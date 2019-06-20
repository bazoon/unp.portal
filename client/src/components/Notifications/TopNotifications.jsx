import React, { Component } from "react";
import "./Notifications.less";
import { observer, inject } from "mobx-react";
import { Row, Col, Table } from "antd";
import Calendar from "../Calendar/Calendar";
import NotificationsList from "./NotificationsList";
import { Link } from "react-router-dom";

@inject("notificationsStore")
@observer
class TopNotifications extends Component {
  render() {
    const { unseen } = this.props.notificationsStore;
    return (
      <>
        <div style={{ maxWidth: "345px" }}>
          <NotificationsList pagination={false} notifications={unseen} />
        </div>
        <div className="top-notification__view-all">
          <Link to="/notifications">Посмотреть все</Link>
        </div>
      </>
    );
  }
}

export default TopNotifications;
