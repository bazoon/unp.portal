import React, { Component } from "react";
import { Button, Icon, Input, Row, Col } from "antd";
import { Table, Divider, Tag, Popconfirm, Popover, Breadcrumb } from "antd";
import { observer, inject } from "mobx-react";
import "./Users.less";
import MoreIcon from "../../../../images/more";
import { Link } from "react-router-dom";
import api from "../../../api/users";

import Calendar from "../../Calendar/Calendar";

const { Search } = Input;

@inject("usersStore")
@inject("currentUserStore")
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
                  <div className="admin-user__name">
                    {record.name}
                    {record.isAdmin && (
                      <span className="admin-user__admin">Админ</span>
                    )}
                  </div>

                  <div className="admin-user__position">
                    {record.position && record.position.name}
                  </div>
                </div>
              </div>
              {this.props.currentUserStore.isAdmin && (
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
              )}
            </div>
          );
        }
      }
    ];
  }

  componentDidMount() {
    this.props.usersStore.loadAllUsers();
  }

  onDoubleClick = (record, event) => {
    this.props.history.push(`/admin/users/edit/${record.id}`);
  };

  onRow = (record, rowIndex) => {
    return {
      onDoubleClick: this.onDoubleClick.bind(this, record)
    };
  };

  handleAddUser = () => {
    this.props.history.push("/admin/users/create");
  };

  handleEdit = id => {
    this.props.history.push(`/admin/users/view/${id}`);
  };

  handleDelete = id => {
    this.props.usersStore.deleteUser(id);
  };

  handleSearch = ({ target: { value } }) => {
    this.props.usersStore.search(value);
  };

  // renders

  renderOperationsMenu(user) {
    return (
      <>
        <div
          className="admin-user__menu-item"
          onClick={() => this.handleEdit(user.id)}
        >
          Редактировать
        </div>
        <div
          className="admin-user__menu-item"
          onClick={() => this.handleDelete(user.id)}
        >
          Удалить
        </div>
      </>
    );
  }

  render() {
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
            <div>
              <div className="section-title">Пользователи</div>

              <div className="project-groups__search">
                <Search
                  placeholder="Поиск по участникам"
                  onChange={this.handleSearch}
                />
              </div>
            </div>
            <div className="admin-users">
              <Table
                showHeader={false}
                rowKey="id"
                columns={this.columns}
                dataSource={this.props.usersStore.users.slice()}
                onRow={this.onRow}
              />
            </div>
          </Col>
          <Col span={8}>
            <div className="section-title">События</div>
            <Calendar />
          </Col>
        </Row>
      </>
    );
  }
}

export default Users;
