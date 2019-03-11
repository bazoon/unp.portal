import React, { Component } from "react";
import { Icon } from "antd";

export class GroupSidebar extends Component {
  render() {
    return (
      <div className="group-sidebar">
        <div className="group-sidebar__item-container">
          <div className="group-sidebar__item">
            <div>
              <Icon type="link" />
              <span>Ссылки</span>
              <span className="group-sidebar__item-note">3</span>
            </div>
            <Icon type="edit" />
          </div>
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          <div className="group-sidebar__item">
            <div>
              <Icon type="paper-clip" />
              <span>Документы</span>
              <span className="group-sidebar__item-note">5</span>
            </div>
            <Icon type="edit" />
          </div>
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          <div className="group-sidebar__item">
            <div>
              <Icon type="play-circle" />
              <span>Фото и видео</span>
              <span className="group-sidebar__item-note">4</span>
            </div>
            <Icon type="edit" />
          </div>
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          <div className="group-sidebar__item">
            <div>
              <Icon type="team" />
              <span>Участники</span>
              <span className="group-sidebar__item-note">1223</span>
            </div>
            <Icon type="eye" />
          </div>
          <ul>
            <li>
              <div className="group-sidebar__avatar" />
              Иванов Иван
            </li>
            <li>
              <div className="group-sidebar__avatar" />
              Ромашкина Анна
            </li>
            <li>
              <div className="group-sidebar__avatar" />
              Семенов Алексей
            </li>
          </ul>
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          <div className="group-sidebar__item">
            <Icon type="meh" />
            <span>Администраторы</span>
            <Icon type="eye" />
          </div>
          <ul>
            <li>
              <div className="group-sidebar__avatar" />
              Петров Петр
            </li>
          </ul>
        </div>
        <hr />
      </div>
    );
  }
}

export default GroupSidebar;
