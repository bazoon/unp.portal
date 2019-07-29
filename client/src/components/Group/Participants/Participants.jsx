import React, { Component } from "react";
import { Breadcrumb, Col, Row, Popover, Table } from "antd";
import { Link } from "react-router-dom";
import moment from "moment";
import MoreIcon from "../../../../images/more";
import { observer, inject } from "mobx-react";
import cn from "classnames";
import "./Participants.less";

@inject("groupsStore")
@inject("currentUserStore")
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
          const className = cn({
            "page-participant__name_waiting": record.state === 2
          });
          return (
            <div className={className}>
              <div>
                {record.name}
                {record.isAdmin && (
                  <span className="admin-user__admin">Админ</span>
                )}
              </div>
              <div>{record.position}</div>
            </div>
          );
        }
      },
      {
        title: "",
        dataIndex: "commands",
        key: "commands",
        align: "right",
        render: (value, record) => {
          const canEdit =
            this.props.groupsStore.current.isAdmin ||
            this.props.currentUserStore.isAdmin;

          return (
            canEdit && (
              <Popover
                placement="bottom"
                content={this.renderMenu(
                  record.id,
                  record.isAdmin,
                  record.state
                )}
                trigger="click"
              >
                <MoreIcon style={{ cursor: "pointer" }} />
              </Popover>
            )
          );
        }
      }
    ];
  }

  handleMakeAdmin = id => {
    this.props.groupsStore.makeAdmin({ id });
  };

  handleRemoveAdmin = id => {
    this.props.groupsStore.removeAdmin({ id });
  };

  handleRemoveFromGroup = id => {
    this.props.groupsStore.removeFromGroup({ id });
  };

  handleApprove = id => {
    this.props.groupsStore.approve({ id });
  };

  handleDecline = id => {
    this.props.groupsStore.decline({ id });
  };

  renderMenu(id, isAdmin, state) {
    const canApprove = state === 2 || state === 3;
    const canDecline = state === 2;

    return (
      <div>
        {state === 1 && (
          <>
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
          </>
        )}

        {canApprove && (
          <div
            className="page-participants__link"
            onClick={() => this.handleApprove(id)}
          >
            Одобрить заявку
          </div>
        )}
        {canDecline && (
          <div
            className="page-participants__link"
            onClick={() => this.handleDecline(id)}
          >
            Отклонить заявку
          </div>
        )}
      </div>
    );
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.groupsStore.getCurrent(id);
  }

  render() {
    const {
      title,
      participants = [],
      avatar,
      isAdmin,
      isOpen,
      isMember,
      canView
    } = this.props.groupsStore.current || {};

    const isSuperAdmin = this.props.currentUserStore.isAdmin;

    const { id } = this.props.match.params;

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
                dataSource={participants.slice()}
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
