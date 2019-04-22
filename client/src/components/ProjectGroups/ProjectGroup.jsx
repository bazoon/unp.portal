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
      count: PropTypes.number
    }).isRequired,
    onUnsubscribe: PropTypes.func.isRequired,
    onSubscribe: PropTypes.func.isRequired
  };

  handleUnsubscribe = () => {
    const { group, onUnsubscribe } = this.props;
    onUnsubscribe(group.id);
  };

  handleSubscribe = () => {
    const { group, onSubscribe } = this.props;
    onSubscribe(group.id);
  };

  renderJoinButton = () => {
    return <Button onClick={this.handleSubscribe}>Присоединиться</Button>;
  };

  renderLeaveButton = () => {
    return (
      <Button
        className="project-group__leave-button"
        onClick={this.handleUnsubscribe}
      >
        Покинуть группу
      </Button>
    );
  };

  render() {
    const { group } = this.props;
    const { id, avatar, title, isOpen, count, participant } = group;

    return (
      <div className="project-group">
        <div className="project-group__info-container">
          <div className="project-group__info">
            <div className="project-group__title">
              <Link to={`/groups/${id}`}>{title}</Link>
            </div>
            <div className="project-group__text">
              {isOpen ? "Открытая группа" : "Закрытая группа"}
            </div>
          </div>
        </div>
        <div className="project-group__operations">
          <div className="project-group__text">
            {count}
            &nbsp;участников
          </div>
          {participant ? this.renderLeaveButton() : this.renderJoinButton()}

          <Popover
            placement="bottom"
            trigger="click"
            content={<Menu onUnsubscribe={this.handleUnsubscribe} />}
          >
            <Button icon="bell" />
          </Popover>
        </div>
      </div>
    );
  }
}

export default ProjectGroup;
