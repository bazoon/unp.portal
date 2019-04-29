import React, { Component } from "react";
import { Button, Popover, Icon } from "antd";
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
    return (
      <Button
        className="project-group__join-button"
        style={{ marginLeft: "24px" }}
        onClick={this.handleSubscribe}
      >
        Присоединиться
      </Button>
    );
  };

  renderLeaveButton = () => {
    return (
      <Button
        className="project-group__leave-button"
        style={{ marginLeft: "24px" }}
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
          {avatar ? (
            <img className="project-group__avatar" src={avatar} alt="avatar" />
          ) : (
            <div className="project-group__avatar project-group__avatar_default" />
          )}

          <div className="project-group__info">
            <div className="project-group__text">
              {isOpen ? "Открытая группа" : "Закрытая группа"}
            </div>
            <div className="project-group__title">
              <Link to={`/groups/${id}`}>{title}</Link>
            </div>
          </div>
        </div>
        <div className="project-group__operations">
          <div style={{ display: "flex", alignItems: "center" }}>
            <Icon type="user" />
            <span className="project-group__count">{count}</span>
          </div>
          <div>
            <Popover
              placement="bottom"
              trigger="click"
              content={<Menu onUnsubscribe={this.handleUnsubscribe} />}
            >
              <Icon type="bell" />
            </Popover>
            {participant ? this.renderLeaveButton() : this.renderJoinButton()}
          </div>
        </div>
      </div>
    );
  }
}

export default ProjectGroup;
