import React, { Component } from "react";
import notifications from "../../utils/notifications";
import { Table } from "antd";
import moment from "moment";

class NotificationsList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "Логин",
        dataIndex: "login",
        key: "login",
        render: (value, record) => {
          const date = moment(record.createdAt).format("DD MMM HH:MM");
          return (
            <div className="notification__user">
              <div className="flex">
                <div className="notification__user-avatar">
                  <img src={record.avatar} />
                </div>
                <div className="notification__description">
                  <span className="notification__date">
                    {date}&nbsp;-&nbsp;
                  </span>
                  {notifications.format(record.description)}
                </div>
              </div>
            </div>
          );
        }
      }
    ];
  }

  render() {
    return (
      <div className="notifications-list">
        <Table
          showHeader={false}
          rowKey="id"
          pagination={this.props.pagination}
          columns={this.columns}
          dataSource={this.props.notifications.slice()}
        />
      </div>
    );
  }
}

export default NotificationsList;
