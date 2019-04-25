import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import moment from "moment";
import { Input, Tooltip, Icon, Button } from "antd";
import { HashLink } from "react-router-hash-link";

import Posts from "../Group/GroupPosts";
import "./Conversation.less";

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

  render() {
    const { conversationId } = this.props.match.params;

    const conversation =
      (this.props.conversations &&
        this.props.conversations[conversationId] &&
        this.props.conversations[conversationId]) ||
      {};
    const postsTree = (conversation && conversation.postsTree) || [];
    const title = conversation && conversation.title;
    return (
      <div className="conversation__container">
        <div className="conversation__title">{title}</div>
        <Posts
          posts={postsTree}
          avatar={this.props.avatar}
          onSend={this.handleSend}
          onReplySend={this.handleReplySend}
          showConversationForm
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    conversations: state.Conversation.conversations,
    avatar: state.Login.avatar,
    userId: state.Login.userId,
    postComments: state.Conversation.posts
  };
};

export default connect(mapStateToProps)(Conversation);
