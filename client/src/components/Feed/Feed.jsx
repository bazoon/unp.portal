import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Input,
  Icon,
  Avatar,
  Upload,
  Select,
  Row,
  Col,
  Table
} from "antd";

import "./Feed.less";
import { observer, inject } from "mobx-react";
import Calendar from "../Calendar/Calendar";
import moment from "moment";
import { Link } from "react-router-dom";

const columns = [
  {
    title: "Наименование",
    dataIndex: "name",
    key: "title",
    render: (value, record) => {
      const date = moment(record.createdAt).fromNow();
      const url = `/groups/${record.groupId}/conversations/${record.id}`;
      return (
        <div className="feed__table-row">
          <div className="feed__item-group">{record.groupTitle}</div>
          <span className="feed__item-author">{record.userName}</span>, &nbsp;
          <span className="feed__item-date">{date}</span>
          <div className="feed__item-title">
            <Link to={url}>{record.title}</Link>
          </div>
        </div>
      );
    }
  }
];

@inject("feedStore")
@inject("eventsStore")
@observer
class Feed extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    const { userId } = this.props;
    this.props.feedStore.load();
    this.props.eventsStore.loadUpcoming();
  };

  // RENDERS

  renderConversations() {
    return (
      <div className="feed__table">
        <Table
          showHeader={false}
          rowKey="id"
          dataSource={this.props.feedStore.items.slice()}
          columns={columns}
          pagination={{
            showQuickJumper: true
          }}
        />
      </div>
    );
  }

  render() {
    return (
      <div className="feed">
        <Row type="flex" gutter={37}>
          <Col span={16}>
            <div className="section-title">Новое на портале</div>
          </Col>
          <Col span={8}>
            <div className="section-title">События</div>
          </Col>
        </Row>
        <Row type="flex" gutter={37}>
          <Col span={16}>{this.renderConversations()}</Col>

          <Col span={8}>
            <Calendar fullscreen={false} />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Feed;
