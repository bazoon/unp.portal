import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
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

const { TextArea } = Input;

class Conversation extends Component {
  componentDidMount = () => {
    const { id, conversationId } = this.props.match.params;
    const { userId } = this.props;

    Actions.getProjectGroup({ id, userId });
    Actions.getConversation(conversationId);
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

    return Actions.sendConversationPost({ conversationId, formData });
  };

  handleReplySend = (comment, post, files = []) => {
    const { userId } = this.props;
    const { conversationId } = this.props.match.params;

    const formData = new FormData();

    formData.append("conversationId", conversationId);
    formData.append("postId", post.id);
    formData.append("userId", userId);
    formData.append("text", comment);

    files.forEach(f => {
      formData.append("file", f);
    });

    return Actions.sendConversationPost({ conversationId, formData });
  };

  handleSubscribe = () => {
    const { id } = this.props.group;
    Actions.postSubscribeGroup({ groupId: id });
  };

  handleUnsubscribe = () => {
    const { id } = this.props.group;
    Actions.postUnsubscribeGroup({ groupId: id });
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
    const { id, title, avatar, participants, participant } = this.props.group;

    const conversation =
      (this.props.conversations &&
        this.props.conversations[conversationId] &&
        this.props.conversations[conversationId]) ||
      {};

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
              <Posts
                posts={postsTree}
                avatar={this.props.avatar}
                onSend={this.handleSend}
                onReplySend={this.handleReplySend}
                showConversationForm
              />
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
              {participant ? (
                <LeaveButton
                  style={{ width: "100%" }}
                  groupId={id}
                  onClick={this.handleUnsubscribe}
                />
              ) : (
                <JoinButton
                  style={{ width: "100%" }}
                  groupId={id}
                  onClick={this.handleSubscribe}
                />
              )}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    conversations: state.Conversation.conversations,
    avatar: state.Login.avatar,
    userId: state.Login.userId,
    postComments: state.Conversation.posts,
    group: state.ProjectGroup.group
  };
};

export default connect(mapStateToProps)(Conversation);
