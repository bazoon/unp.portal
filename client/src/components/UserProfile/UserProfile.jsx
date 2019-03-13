import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./UserProfile.less";
import UserProfilePreferences from "./UserProfilePreferences";

export class UserProfile extends Component {
  render() {
    return (
      <div className="user-profile__container">
        <div className="user-profile">
          <div className="user-profile__avatar">
            <img src="https://fakeimg.pl/200x200" alt="Фото пользователя" />
          </div>
          <div className="user-profile__info-container">
            <div className="user-profile__info">
              <div className="user-profile__info-lines">
                <div className="user-profile__title">Соколова Виктория</div>
                <hr />
                <div>Отдел</div>
                <div>email</div>
                <div>Телефон</div>
              </div>
              <div className="user-profile__groups">
                <div className="user-profile__groups-in">
                  <div>Участник в группах</div>
                  <ul>
                    <li>
                      <img src="https://fakeimg.pl/40x40" alt="" />
                      <Link to="/group/1">Федеральные проекты</Link>
                    </li>
                    <li>
                      <img src="https://fakeimg.pl/40x40" alt="" />
                      <Link to="/group/1">Национальные проекты</Link>
                    </li>
                  </ul>
                </div>
                <div className="user-profile__groups-in">
                  <div>Администратор в группах</div>
                  <ul>
                    <li>
                      <img src="https://fakeimg.pl/40x40" alt="" />
                      <Link to="/group/1">Региональные проекты</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <UserProfilePreferences />
      </div>
    );
  }
}

export default UserProfile;
