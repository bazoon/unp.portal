import React, { Component } from "react";
import { connect } from "react-redux";

import { Input, Layout } from "antd";
import { ProjectGroup } from "../ProjectGroups/ProjectGroup";
import { Actions } from "jumpstate";
import Posts from "./GroupPosts";
const { Sider } = Layout;

class GroupFeed extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    Actions.getOwnGroupPosts(id);
  }

  handleSend = (text, uploadFiles) => {
    const { id } = this.props.match.params;
    const { userId } = this.props;

    const formData = new FormData();
    formData.append("groupId", id);
    formData.append("userId", userId);
    formData.append("text", text);
    uploadFiles.forEach(f => {
      formData.append("file", f);
    });

    return Actions.sendGroupPost({ id, formData });
  };

  handleReplySend = (comment, post, files = []) => {
    const { id } = this.props.match.params;
    const { userId } = this.props;

    const formData = new FormData();

    formData.append("groupId", id);
    formData.append("postId", post.id);
    formData.append("userId", userId);
    formData.append("text", comment);

    files.forEach(f => {
      formData.append("file", f);
    });

    return Actions.sendGroupPost({ id, formData });
  };

  render() {
    const { title } = this.props.group;

    return (
      <div className="group-feed">
        <div className="group__name">{title}</div>
        <Posts
          posts={this.props.posts}
          onReplySend={this.handleReplySend}
          onSend={this.handleSend}
        />
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    posts: state.ProjectGroup.posts,
    group: state.ProjectGroup.group
  };
};

export default connect(mapStateToProps)(GroupFeed);
