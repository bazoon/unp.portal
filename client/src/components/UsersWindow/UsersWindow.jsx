import React, { Component } from "react";
import { Modal, Button, Input } from "antd";
import UsersSelect from "./UsersSelect";
import "./UsersWindow.less";
import api from "../../api/users";

const { Search } = Input;

class UsersWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {},
      users: []
    };
  }

  componentDidMount() {
    this.search("all");
  }

  search(query) {
    api.searchName(query).then(users => {
      this.setState({
        users
      });
    });
  }

  handleSelectUser = id => {
    const checked = this.state.selectedUsers[id];
    this.setState({
      selectedUsers: { ...this.state.selectedUsers, [id]: !checked }
    });
  };

  handleOk = () => {
    this.props.onOk(Object.keys(this.state.selectedUsers)).then(() => {
      this.setState({ selectedUsers: [] });
    });
  };

  handleSearch = ({ target }) => {
    this.search(target.value || "all");
  }

  renderFooter = () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button onClick={this.handleOk} type="primary">Добавить</Button>
      </div>
    );
  }

  render() {
    return (
      <Modal
        className="users-window"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        title={this.props.title}
        closable={false}
        footer={this.renderFooter()}
      >
        <div>
          <div className="users-window__search">
            <Search placeholder="Поиск по участникам" onChange={this.handleSearch} />
          </div>

        </div>
        <UsersSelect
          users={this.state.users}
          selectedUsers={this.state.selectedUsers}
          handleSelectUser={this.handleSelectUser}
        />
      </Modal>
    );
  }
}

export default UsersWindow;
