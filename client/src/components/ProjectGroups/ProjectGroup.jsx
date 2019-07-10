import React, { Component } from "react";
import { Button, Popover, Icon, Breadcrumb, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import {
  pluralizeParticipants,
  pluralizeConversations
} from "../../utils/pluralize";
import { observer, inject } from "mobx-react";
import GroupButton from "./GroupButton";

@inject("currentUserStore")
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

    const isSuperAdmin = this.props.currentUserStore.isAdmin;

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
                  {pluralizeConversations(conversationsCount)}
                </span>
                <span>{pluralizeParticipants(participantsCount)}</span>
              </div>
            </div>
          </div>

          <div>
            {(isAdmin || isSuperAdmin) && (
              <Popconfirm
                title={
                  <div style={{ width: "300px" }}>
                    Удаление группы приведет к удалению новостей и обсуждений
                    этой группы, а так же документов, использовавшихся в этих
                    группах. Удалить?
                  </div>
                }
                onConfirm={() => this.props.onDelete(id)}
              >
                <Button style={{ marginBottom: "4px" }} type="danger">
                  Удалить группу
                </Button>
              </Popconfirm>
            )}

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
        </div>
      </>
    );
  }
}

export default ProjectGroup;
