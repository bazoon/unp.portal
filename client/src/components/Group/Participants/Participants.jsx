import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Input,
  Layout,
  Breadcrumb,
  Col,
  Row,
  Button,
  Icon,
  Carousel,
  Popover,
  Table
} from "antd";
import { Actions } from "jumpstate";
import { Link } from "react-router-dom";
import moment from "moment";
import MoreIcon from "../../../../images/more";
import { observer, inject } from "mobx-react";
import "./Participants.less";

@inject("projectGroups")
@observer
class Participants extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "",
        dataIndex: "avatar",
        key: "avatar",
        render: value => {
          return <img src={value} className="page-participant__avatar" />;
        }
      },
      {
        title: "",
        dataIndex: "position",
        key: "position",
        render: (value, record) => {
          return (
            <div>
              <div>{record.name}</div>
              <div>{record.position}</div>
            </div>
          );
        }
      },
      {
        title: "",
        dataIndex: "commands",
        key: "commands",
        render: (value, record) => (
          <Popover
            placement="bottom"
            content={this.renderMenu(record.id)}
            trigger="click"
          >
            <div style={{ cursor: "pointer" }}>
              <MoreIcon style={{ cursor: "pointer" }} />
            </div>
          </Popover>
        )
      }
    ];
  }

  handleMakeAdmin = (id, userId) => {
    Actions.postMakeAdmin({ id, userId });
  };

  handleRemoveFromGroup = (id, userId) => {
    Actions.postRemoveFromGroup({ id, userId });
  };

  renderMenu(userId) {
    const { id } = this.props.match.params;
    return (
      <div>
        <div
          onClick={() => this.handleRemoveFromGroup(id, userId)}
          className="page-participants__link"
        >
          Удалить из группы
        </div>
        <div
          onClick={() => this.handleMakeAdmin(id, userId)}
          className="page-participants__link"
        >
          Назначить админом
        </div>
      </div>
    );
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.projectGroups.getCurrent(id);
  }

  render() {
    const {
      title,
      participants,
      avatar
    } = this.props.projectGroups.currentGroup;
    const { id } = this.props.match.params;

    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/groups">Группы</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/groups/${id}`}>{title}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Участники</Breadcrumb.Item>
        </Breadcrumb>

        <Row type="flex" gutter={37}>
          <Col span={16} style={{ background: "#fff" }}>
            <div className="page-participants">
              <Table
                rowKey="id"
                showHeader={false}
                dataSource={participants}
                columns={this.columns}
              />
            </div>
          </Col>

          <Col span={8}>
            <div
              className="conversation__group-header"
              style={{
                backgroundImage: `url(${avatar})`
              }}
            >
              {title}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default Participants;
