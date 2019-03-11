import React, { Component } from "react";
import "./Notifications.less";

class Notifications extends Component {
  render() {
    return (
      <div className="notifications">
        <div className="notifications__title">Новые</div>
        <div className="notifications__items">
          <div className="notifications__item">
            <div className="notifications__avatar">
              <img src="https://fakeimg.pl/50x50" alt="logo" />
            </div>
            <div className="notifications__text">
              <b>Иванов Петр</b>
              сделал новую публикацию в группе
              <b>Национальные проекты</b>
            </div>
            <hr />
          </div>
          <div className="notifications__item">
            <div className="notifications__avatar">
              <img src="https://fakeimg.pl/50x50" alt="logo" />
            </div>
            <div className="notifications__text">
              <b>Петров Иван</b>
              сделал новую публикацию в группе
              <b>Региональные проекты</b>
            </div>
            <hr />
          </div>
        </div>
        <div className="notifications__title">Предыдущее</div>
        <div className="notifications__items">
          <div className="notifications__item">
            <div className="notifications__avatar">
              <img src="https://fakeimg.pl/50x50" alt="logo" />
            </div>
            <div className="notifications__text">
              <b>Петров Иван</b>
              сделал новую публикацию в группе
              <b>Региональные проекты</b>
            </div>
            <hr />
          </div>
        </div>
      </div>
    );
  }
}

export default Notifications;
