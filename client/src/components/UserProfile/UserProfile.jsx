import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./UserProfile.less";
import NotificationPreferences from "./NotificationPreferences";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import Preferences from "./reducer";

class UserProfile extends Component {
  static defaultProps = {
    profile: {}
  };

  componentDidMount = () => {
    const userId = localStorage.getItem("userId");
    Actions.getPreferences(userId);
    Actions.getNotificationPreferences(userId);
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

  render() {
    const { userId } = this.props;
    let { name, avatar, position, groups, adminGroups } = this.props.profile;
    groups = groups || [];
    adminGroups = adminGroups || [];

    return (
      <div className="user-profile__container">
        <div className="user-profile">
          <div className="user-profile__avatar">
            <img src={avatar} alt="Фото пользователя" />
          </div>
          <div className="user-profile__info-container">
            <div className="user-profile__info">
              <div className="user-profile__info-lines">
                <div className="user-profile__title">{name}</div>
                <hr />
                <div>Отдел</div>
                <div>email</div>
                <div>Телефон</div>
                <div>{position}</div>
              </div>
              <div className="user-profile__groups">
                <div className="user-profile__groups-in">
                  <div>Участник в группах</div>
                  {this.renderGroups(groups)}
                </div>
                <div className="user-profile__groups-in">
                  <div>Администратор в группах</div>
                  {this.renderGroups(adminGroups)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <NotificationPreferences
          userId={userId}
          preferences={this.props.notificationPreferences}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    avatar: state.Login.avatar,
    userId: state.Login.userId,
    profile: state.UserProfilePreferences.profile,
    notificationPreferences:
      state.UserProfilePreferences.notificationPreferences
  };
};

export default connect(mapStateToProps)(UserProfile);
