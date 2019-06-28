import React, { Component } from "react";
import "./Notifications.less";
import { observer, inject } from "mobx-react";
import { Row, Col, Table } from "antd";
import Calendar from "../Calendar/Calendar";
import NotificationsList from "./NotificationsList";

@inject("notificationsStore")
@observer
class Notifications extends Component {
  componentDidMount() {
    this.props.notificationsStore.load();
  }

  render() {
    const { items } = this.props.notificationsStore;
    return (
      <Row gutter={17}>
        <Col span={16}>
          <div className="section-title">Уведомления</div>
          <NotificationsList notifications={items.slice()} />
        </Col>
        <Col span={8}>
          <div className="section-title">События</div>

          <Calendar />
        </Col>
      </Row>
    );
  }
}

export default Notifications;
