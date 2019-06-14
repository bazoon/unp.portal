import React, { Component } from "react";

import {
  Icon,
  Input,
  Row,
  Col,
  Table,
  Divider,
  Tag,
  Popconfirm,
  Popover,
  Breadcrumb,
  Button,
  Pagination
} from "antd";
import { observer, inject } from "mobx-react";
import "./Users.less";
import MoreIcon from "../../../../images/more";
import { Link } from "react-router-dom";

import {
  pluralizeParticipants,
  pluralizeConversations
} from "../../../utils/pluralize";

const { Search } = Input;

@inject("usersStore")
@observer
class Users extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: "Логин",
        dataIndex: "login",
        key: "login",
        render: (value, record) => {
          return (
            <div className="admin-user">
              <div className="flex">
                <div className="admin-user__avatar">
                  <img src={record.avatar} />
                </div>
                <div className="admin-user__info">
                  <div>{record.name}</div>
                  <div>{record.position && record.position.name}</div>
                </div>
              </div>
              <div>
                <Popover
                  placement="bottom"
                  content={this.renderOperationsMenu(record)}
                  trigger="click"
                >
                  <div style={{ cursor: "pointer" }}>
                    <MoreIcon style={{ cursor: "pointer" }} />
                  </div>
                </Popover>
              </div>
            </div>
          );
        }
      }
    ];
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.usersStore.get(id);
    this.props.usersStore.loadUserGroups(id);
  }

  handleEditUser = () => {
    const { id } = this.props.match.params;
    this.props.history.push(`/admin/users/edit/${id}`);
  };

  handleChangePagination = page => {
    this.props.usersStore.setGroupsPagionation(page);
  };

  renderOperationsMenu(user) {
    return (
      <>
        <div
          className="admin-user__menu-item"
          onClick={() => this.handleUnpin(id)}
        >
          Редактировать
        </div>
        <div
          className="admin-user__menu-item"
          onClick={() => this.handleUnpin(id)}
        >
          Удалить
        </div>
      </>
    );
  }

  render() {
    const { usersStore } = this.props;
    const user = usersStore.currentUser || {};
    const groups = usersStore.currentUserGroups || [];

    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Пользователи</Breadcrumb.Item>
        </Breadcrumb>
        <Row gutter={37}>
          <Col span={16}>
            <div className="section-title">Карточка пользователя</div>
            <div className="user__view-card">
              <table>
                <tr className="user__view-card-row_border">
                  <td>Аватар</td>
                  <td>
                    <img className="user__view-card-avatar" src={user.avatar} />
                  </td>
                </tr>
                <tr>
                  <td>Фамилия</td>
                  <td>{usersStore.surName}</td>
                </tr>
                <tr>
                  <td>Имя</td>
                  <td>{usersStore.firstName}</td>
                </tr>
                <tr className="user__view-card-row_border">
                  <td>Отчество</td>
                  <td>{usersStore.lastName}</td>
                </tr>
                <tr>
                  <td>Организация</td>
                  <td>{usersStore.organization}</td>
                </tr>
                <tr className="user__view-card-row_border">
                  <td>Должность</td>
                  <td>{usersStore.position}</td>
                </tr>
                <tr>
                  <td>Логин</td>
                  <td>{user.login}</td>
                </tr>
                <tr className="user__view-card-row_border">
                  <td>Пароль</td>
                  <td>*******</td>
                </tr>
              </table>
              <Button onClick={this.handleEditUser}>Редактировать</Button>
            </div>

            <div className="user__groups">
              {groups.map(group => {
                return (
                  <div className="user__group">
                    <div className="user__group-info">
                      <div className="user__group-avatar">
                        {group.avatar && <img src={group.avatar} />}
                      </div>
                      <div>
                        <div className="user__group-title">
                          <Link to={`/groups/${group.id}`}>{group.title}</Link>
                        </div>
                        <div className="user__group-misc">
                          <span>
                            {pluralizeConversations(group.conversationsCount)}
                          </span>
                          <span>
                            {pluralizeParticipants(group.participantsCount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="user__groups-pagination">
              <Pagination
                showQuickJumper
                onChange={this.handleChangePagination}
                total={this.props.usersStore.groupsTotal}
                pageSize={this.props.usersStore.groupsPageSize}
              />
            </div>
          </Col>
          <Col span={8}>Calendar</Col>
        </Row>
      </>
    );
  }
}

export default Users;
