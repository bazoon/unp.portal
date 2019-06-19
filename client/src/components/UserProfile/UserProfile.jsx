import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./UserProfile.less";
import NotificationPreferences from "./NotificationPreferences";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import Preferences from "./reducer";
import UserForm from "../Admin/Users/UserForm";

class UserProfile extends Component {
  static defaultProps = {
    profile: {}
  };

  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  componentDidMount = () => {
    const userId = localStorage.getItem("userId");
    Actions.getNotificationPreferences(userId);
  };

  handleFileChange = e => {
    const formData = new FormData();
    const { userId } = this.props;
    const files = Array.prototype.map.call(e.target.files, f => f);
    formData.append("userId", userId);
    files.forEach(f => {
      formData.append("file", f);
    });

    Actions.postUserAvatar(formData);
  };

  handleAvatarClick = () => {
    const input = this.formRef.current.querySelector("input[type=file]");
    input.click();
  };

  renderGroups(groups) {
    return (
      <ul>
        {groups.map(group => {
          return (
            <li key={group.id}>
              <img
                className="user-profile__group-logo"
                src={group.avatar}
                alt=""
              />
              <Link to={`/group/${group.id}`}>{group.title}</Link>
            </li>
          );
        })}
      </ul>
    );
  }

  renderFileForm = () => {
    return (
      <form
        action="/upload"
        method="post"
        encType="multipart/form-data"
        ref={this.formRef}
        style={{ display: "none" }}
      >
        <input type="file" name="file" onChange={this.handleFileChange} />
      </form>
    );
  };

  render() {
    const { userId } = this.props;
    let {
      userName,
      avatar,
      position,
      groups,
      adminGroups
    } = this.props.profile;
    groups = groups || [];
    adminGroups = adminGroups || [];

    return (
      <UserForm
        ref={this.formRef}
        onSubmit={() => {}}
        organizations={this.props.organizations}
        positions={this.props.positions}
        user={this.props.usersStore.currentUser}
        onSave={this.handleSave}
      />
    );
  }
}

export default UserProfile;
