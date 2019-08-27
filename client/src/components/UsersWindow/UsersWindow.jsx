import React, { Component } from "react";
import { Modal } from "antd";
import UsersSelect from "./UsersSelect";
import { observer, inject } from "mobx-react";

@observer
class UsersWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: {}
    };
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

  render() {
    return (
      <Modal
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
        title={this.props.title}
      >
        <UsersSelect
          users={this.props.users}
          selectedUsers={this.state.selectedUsers}
          handleSelectUser={this.handleSelectUser}
        />
      </Modal>
    );
  }
}

export default UsersWindow;
