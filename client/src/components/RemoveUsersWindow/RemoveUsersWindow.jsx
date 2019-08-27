import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import api from "../../api/chat";
import UsersSelect from '../UsersWindow/UsersSelect';
import { Modal } from 'antd';

@inject("chatStore")
@observer
class RemoveUsersWindow extends Component {
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
        title="Удалить пользователей"
      >
        <UsersSelect
          users={participants}
          selectedUsers={{}}
          handleSelectUser={this.handleSelectUser}
        />
      </Modal>
    );
  }
}

export default RemoveUsersWindow;
