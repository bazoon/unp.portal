import React, { Component } from "react";
import { Button, Popover, Icon, Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { pluralize } from "../../utils/pluralize";
import JoinButton from "./JoinButton";
import LeaveButton from "./LeaveButton";
import RequestButton from "./RequestButton";

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

  renderLeaveButton(id) {
    return <LeaveButton groupId={id} onClick={this.handleUnsubscribe} />;
  }

  renderJoinButton(id) {
    return <JoinButton groupId={id} onClick={this.handleSubscribe} />;
  }

  renderRequestButton(id) {
    return <RequestButton groupId={id} onClick={this.handleSubscribe} />;
  }

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
    const {
      id,
      avatar,
      title,
      isOpen,
      participantsCount,
      conversationsCount,
      participant,
      isAdmin
    } = group;

    const conversationPlurals = ["обсуждение", "обсуждения", "обсуждений"];
    const participantsPlurals = ["участник", "участника", "участников"];

    return (
      <>
        <div className="project-group">
          <div className="project-group__info-container">
            <div className="project-group__info">
              <div className="project-group__title">
                <Link to={`/groups/${id}`}>{title}</Link>
              </div>
              <div className="project-group__footer">
                <span style={{ marginRight: "8px" }}>
                  {pluralize(conversationsCount, conversationPlurals)}
                </span>
                <span>{pluralize(participantsCount, participantsPlurals)}</span>
              </div>
            </div>
          </div>

          {(isOpen || isAdmin) &&
            (participant
              ? this.renderLeaveButton(id)
              : this.renderJoinButton(id))}

          {!isOpen &&
            !isAdmin &&
            (participant
              ? this.renderLeaveButton(id)
              : this.renderRequestButton(id))}
        </div>
      </>
    );
  }
}

export default ProjectGroup;
