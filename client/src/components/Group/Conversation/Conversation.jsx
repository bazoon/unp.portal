import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";
import { Popover } from "antd";
import moment from "moment";
import cn from "classnames";
import { pluralizeComments } from "../../../utils/pluralize";
import MoreIcon from "../../../../images/more";
import ChatWaitIcon from "../../../../images/chat_wait";

@inject("groupsStore")
@observer
class Conversation extends Component {
  handlePin = conversationId => {
    this.props.groupsStore.pin(conversationId);
  };

  handleUnpin = conversationId => {
    this.props.groupsStore.unpin(conversationId);
  };

  renderConversationMenu(id, isPinned) {
    return (
      <>
        {isPinned ? (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => this.handleUnpin(id)}
            className="group-unpin"
          >
            Открепить
          </div>
        ) : (
          <div
            className="group-pin"
            style={{ cursor: "pointer" }}
            onClick={() => this.handlePin(id)}
          >
            Закрепить
          </div>
        )}
      </>
    );
  }

  render() {
    const groupId = this.props.groupId;
    const { showMenu } = this.props;
    const date = moment(this.props.createdAt).fromNow();
    const link = `/groups/${groupId}/conversation/${this.props.id}`;
    const className = cn("group__conversation", {
      group__conversation_news: !this.props.isCommentable
    });

    return (
      <div key={this.props.id} className={className}>
        <div className="group__conversation-header">
          <div style={{ display: "flex" }}>
            <div className="group__conversation-user">
              Написал &nbsp; {this.props.name}
            </div>
            <div className="group__conversation-date">{date}</div>
          </div>
          {showMenu && (
            <Popover
              placement="bottom"
              content={this.renderConversationMenu(
                this.props.id,
                this.props.isPinned
              )}
              trigger="click"
            >
              <div style={{ cursor: "pointer" }}>
                <MoreIcon style={{ cursor: "pointer" }} />
              </div>
            </Popover>
          )}
        </div>
        <div className="group__conversation-title">
          <Link to={link}>{this.props.title}</Link>
        </div>
        <div className="group__conversation-description">
          {this.props.description}
        </div>
        <div className="group__conversation-footer">
          {this.props.isCommentable && (
            <>
              <ChatWaitIcon
                style={{ marginRight: "8px" }}
                className="svg-icon"
              />
              <Link to={link}>{pluralizeComments(this.props.count)}</Link>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default Conversation;
