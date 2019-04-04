import React, { Component } from "react";
import { Button, Popover } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Menu } from "./Menu";

export class ProjectGroup extends Component {
  static propTypes = {
    group: PropTypes.shape({
      id: PropTypes.number,
      avatar: PropTypes.string,
      title: PropTypes.string,
      isOpen: PropTypes.bool,
      count: PropTypes.string
    }).isRequired
  };

  render() {
    const { group } = this.props;
    const { id, avatar, title, isOpen, count } = group;

    return (
      <div className="project-group">
        <div className="project-group__info-container">
          <div className="project-group__avatar">
            <img src={avatar} alt="Лого группы" />
          </div>
          <div className="project-group__info">
            <div className="project-group__title">
              <Link to={`/group/${id}`}>{title}</Link>
            </div>
            <div className="project-group__text">
              {isOpen ? "Открытая группа" : "Закрытая группа"}
            </div>
            <div className="project-group__text">
              {count}
              &nbsp;участников
            </div>
          </div>
        </div>
        <div className="project-group__operations">
          <Button>Запрос на участие</Button>
          <Popover placement="bottom" trigger="click" content={<Menu />}>
            <Button icon="more" />
          </Popover>
        </div>
      </div>
    );
  }
}

export default ProjectGroup;
