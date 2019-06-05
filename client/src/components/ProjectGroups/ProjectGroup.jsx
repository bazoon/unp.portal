import React, { Component } from "react";
import { Button, Popover, Icon, Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { pluralize } from "../../utils/pluralize";
import JoinButton from "./JoinButton";
import LeaveButton from "./LeaveButton";
import RequestButton from "./RequestButton";
import { observer, inject } from "mobx-react";
import WaitButton from "./WaitButton";
import GroupButton from "./GroupButton";

@observer
class ProjectGroup extends Component {
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

  handleRequest = () => {
    const { group, onRequest } = this.props;
    onRequest(group.id);
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
      isAdmin,
      state
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

          <GroupButton
            isOpen={isOpen}
            isAdmin={isAdmin}
            state={state}
            participant={participant}
            onJoin={this.handleSubscribe}
            onLeave={this.handleUnsubscribe}
            onRequest={this.handleRequest}
          />
        </div>
      </>
    );
  }
}

export default ProjectGroup;
