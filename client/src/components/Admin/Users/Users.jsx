import React, { Component } from "react";
import { Button, Icon, Input } from "antd";
import { Actions } from "jumpstate";
import { Table, Divider, Tag, Popconfirm } from "antd";
import { connect } from "react-redux";

const { Search } = Input;

function handleDelete(id) {
  Actions.deleteUser({ id });
}

const columns = [
  {
    title: "Логин",
    dataIndex: "login",
    key: "login"
  },
  {
    title: "ФИО",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "Организация",
    dataIndex: "organization",
    key: "organization",
    render: organization => {
      return organization && organization.name;
    }
  },
  {
    title: "Должность",
    dataIndex: "position",
    key: "position",
    render: position => {
      return position && position.name;
    }
  },
  {
    title: "",
    dataIndex: "",
    key: "x",
    render: (_, record) => {
      return (
        <Popconfirm title="Удалить?" onConfirm={() => handleDelete(record.id)}>
          <Icon type="user-delete" />
        </Popconfirm>
      );
    }
  }
];

class Users extends Component {
  componentDidMount() {
    Actions.getAdminUsers();
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

  render() {
    return (
      <>
        <div className="section-header">
          <div className="section-title">Пользователи</div>

          <Search placeholder="Поиск пользователя" style={{ width: "30%" }} />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <Button onClick={this.handleAddUser}>Создать пользователя</Button>
        </div>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={this.props.users}
          onRow={this.onRow}
        />
      </>
    );
  }
}
const mapStateToProps = state => {
  return {
    users: state.Admin.users
  };
};
export default connect(mapStateToProps)(Users);
