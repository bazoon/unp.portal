import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import cn from "classnames";

@inject("usersStore")
@inject("chatStore")
@observer
class Users extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedUserId: undefined
    };
  }

  handleCreatePrivateChat = () => {
    this.props.chatStore
      .createPrivateChat(this.state.selectedUserId)
      .then(() => {
        this.props.chatStore.switchToChat();
      });
  };

  handleSelectUser = id => {
    this.setState({
      selectedUserId: id
    });
  };


  render() {
    const { users } = this.props.usersStore;
    const { selectedUserId } = this.state;

    return users.map(user => {
      const className = cn("chat__users-item", {
        "chat__users-item_active": selectedUserId === user.id
      });

      return (
        <div
          key={user.id}
          className={className}
          onClick={() => this.handleSelectUser(user.id)}
          onDoubleClick={this.handleCreatePrivateChat}
        >
          <div className="chat__users-avatar">
            <img src={user.avatar} />
          </div>

          <div className="chat__users-name">{user.name}</div>
        </div>
      );
    });
  }
}

export default Users;
