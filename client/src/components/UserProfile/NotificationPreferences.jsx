import React, { Component } from "react";
import { Table, Checkbox } from "antd";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import Preferences from "./reducer";

class NotificationPreferences extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: "Наименование",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "Тип",
        dataIndex: "type",
        key: "type"
      },
      {
        title: "SMS",
        dataIndex: "sms",
        key: "sms",
        render: (value, record, index) => {
          return (
            <Checkbox
              checked={value}
              onChange={e => this.handleCheckChange(e, record, "sms")}
            />
          );
        }
      },
      {
        title: "Push",
        dataIndex: "push",
        key: "push",
        render: (value, record, index) => {
          return (
            <Checkbox
              checked={value}
              onChange={e => this.handleCheckChange(e, record, "push")}
            />
          );
        }
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (value, record, index) => {
          return (
            <Checkbox
              checked={value}
              onChange={e => this.handleCheckChange(e, record, "email")}
            />
          );
        }
      }
    ];
  }

  handleCheckChange = (e, record, type) => {
    const { userId } = this.props;
    Actions.saveNotificationPreferences({
      id: record.id,
      type,
      value: e.target.checked,
      userId
    });
  };

  render() {
    const { preferences } = this.props;
    return (
      <div className="user-profile__preferences">
        <Table rowKey="id" dataSource={preferences} columns={this.columns} />
      </div>
    );
  }
}

export default NotificationPreferences;
