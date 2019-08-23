import React, { Component } from "react";
import { Checkbox } from "antd";
import { observer, inject } from "mobx-react";

@inject("currentUserStore")
@inject("usersStore")
@observer
class UsersSelect extends Component {
  render() {
    return (
      <div style={{ height: "300px", overflowY: "auto" }}>
        {this.props.usersStore.users.map(user => {
          const checked = this.props.selectedUsers[user.id];
          return (
            <div key={user.id} className="chat__group-creation-user">
              <div className="chat__group-creation-user-wrap">
                <img
                  className="chat__group-creation-user-avatar"
                  src={user.avatar}
                  alt="avatar"
                />
                <div className="chat__group-creation-user-name">
                  {user.name}
                </div>
              </div>
              <Checkbox
                checked={checked}
                onClick={() => this.props.handleSelectUser(user.id)}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

export default UsersSelect;
