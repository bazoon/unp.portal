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
        render: (value, record) =>
          this.props.projectGroups.currentGroup.isAdmin && (
            <Popover
              placement="bottom"
              content={this.renderMenu(
                record.id,
                record.isAdmin,
                record.isMember
              )}
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

  handleMakeAdmin = id => {
    this.props.projectGroups.makeAdmin({ id });
  };

  handleRemoveAdmin = id => {
    this.props.projectGroups.removeAdmin({ id });
  };

  handleRemoveFromGroup = (id, userId) => {
    this.props.projectGroups.removeFromGroup({ id, userId });
  };

  handleApprove = id => {
    this.props.projectGroups.approve({ id });
  };

  renderMenu(id, isAdmin, isMember) {
    return (
      <div>
        <div
          onClick={() => this.handleRemoveFromGroup(id)}
          className="page-participants__link"
        >
          Удалить из группы
        </div>
        {isAdmin ? (
          <div
            onClick={() => this.handleRemoveAdmin(id)}
            className="page-participants__link"
          >
            Удалить из админов
          </div>
        ) : (
          <div
            onClick={() => this.handleMakeAdmin(id)}
            className="page-participants__link"
          >
            Назначить админом
          </div>
        )}
        {isMember === false && (
          <div onClick={() => this.handleApprove(id)}>Одобрить заявку</div>
        )}
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
      avatar,
      isAdmin,
      isOpen,
      isMember
    } = this.props.projectGroups.currentGroup;

    const { id } = this.props.match.params;
    const canView = isAdmin || isOpen || isMember;
    if (!canView) {
      return <div>Нет доступа</div>;
    }

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
                pagination={{
                  showQuickJumper: true
                }}
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
