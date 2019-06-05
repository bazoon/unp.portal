import React, { Component } from "react";
import moment from "moment";
import { Input, Tooltip, Icon, Button, Breadcrumb, Row, Col } from "antd";
import { HashLink } from "react-router-hash-link";
import Posts from "../Group/GroupPosts";
import "./Conversation.less";
import { Link } from "react-router-dom";
import Participants from "../Group/Participants";
import JoinButton from "../ProjectGroups/JoinButton";
import LeaveButton from "../ProjectGroups/LeaveButton";
import Files from "../Group/Files";
import PinnedIcon from "../../../images/pin";
import { observer, inject } from "mobx-react";
import GroupButton from "../ProjectGroups/GroupButton";
const { TextArea } = Input;

@inject("projectGroups")
@inject("currentUser")
@observer
class Conversation extends Component {
  componentDidMount = () => {
    const { id, conversationId } = this.props.match.params;

    this.props.projectGroups.getCurrent(id).then(() => {
      this.props.projectGroups.currentGroup.loadConversation(conversationId);
    });
  };

  handleSend = (text, uploadFiles) => {
    const { conversationId } = this.props.match.params;
    const { userId } = this.props;

    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("userId", userId);
    formData.append("text", text);
    uploadFiles.forEach(f => {
      formData.append("file", f);
    });

    return this.props.projectGroups.currentGroup.sendPost(formData);
  };

  handleReplySend = (comment, post, files = []) => {
    const { conversationId } = this.props.match.params;

    const formData = new FormData();

    formData.append("conversationId", conversationId);
    formData.append("postId", post.id);
    formData.append("text", comment);

    files.forEach(f => {
      formData.append("file", f);
    });

    return this.props.projectGroups.currentGroup.sendPost(formData);
  };

  handleSubscribe = () => {
    const { id } = this.props.match.params;
    this.props.projectGroups.subscribeToCurrent(id);
  };

  handleUnsubscribe = () => {
    const { id } = this.props.match.params;
    this.props.projectGroups.unsubscribeFromCurrent(id);
  };

  handlePin = () => {
    const { conversationId } = this.props.match.params;
    Actions.postPinConversation({ conversationId, pinned: true });
  };

  renderConversation(conversation) {
    const date = moment(conversation.created_at).fromNow();

    return (
      <div className="group__conversations">
        {
          <div key={conversation.id} className="group__conversation">
            <div className="group__conversation-header">
              <div className="group__conversation-user">
                {conversation.name}
              </div>
              <div className="group__conversation-date">{date}</div>
            </div>
            <div className="group__conversation-title">
              {conversation.title}
            </div>
            <div className="group__conversation-description">
              {conversation.description}
            </div>
            <div>
              <Files files={conversation.files} />
            </div>
            <div className="group__conversation-footer">
              <PinnedIcon onClick={this.handlePin} />
            </div>
          </div>
        }
      </div>
    );
  }

  render() {
    const { conversationId } = this.props.match.params;
    const {
      id,
      title,
      avatar,
      participants,
      participant,
      isOpen,
      isAdmin,
      isMember
    } = this.props.projectGroups.currentGroup;

    const conversation =
      this.props.projectGroups.currentGroup.currentConversation || {};

    const postsTree = (conversation && conversation.postsTree) || [];
    const conversationTitle = conversation && conversation.title;
    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/groups">Группы</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/groups/${id}`}>{title}</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{conversationTitle}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={27}>
          <Col span={16}>
            <div className="conversation__container">
              {this.renderConversation(conversation)}
              {conversation.isCommentable && (
                <Posts
                  posts={postsTree}
                  avatar={this.props.currentUser.avatar}
                  onSend={this.handleSend}
                  onReplySend={this.handleReplySend}
                  showConversationForm
                />
              )}
            </div>
          </Col>
          <Col span={8}>
            <div
              className="conversation__group-header"
              style={{
                backgroundImage: `url(${avatar})`
              }}
            >
              {title}
            </div>
            <div className="group__add-info">
              <Participants participants={participants} />

              <GroupButton
                isOpen={isOpen}
                isAdmin={isAdmin}
                isMember={isMember}
                participant={participant}
                onJoin={this.handleSubscribe}
                onLeave={this.handleUnsubscribe}
                onRequest={this.handleSubscribe}
              />
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default Conversation;
