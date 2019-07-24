import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Input, Icon, Button } from "antd";
import { HashLink } from "react-router-hash-link";
import prettyBytes from "pretty-bytes";
import getFileIcon from "../../utils/getFileIcon";
import getFileName from "../../utils/getFileName";
import cn from "classnames";

import SendIcon from "../../../images/send";
import UploadIcon from "../../../images/upload";
import UploadWindow from "../UploadWindow/UploadWindow";

const LEVEL_PADDING = 24;

class GroupPosts extends Component {
  static propTypes = {
    posts: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSend: PropTypes.func.isRequired,
    onReplySend: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      currentPost: "",
      postRepliesVisible: {},
      postReplies: {},
      uploadFiles: [],
      replyUploadFiles: {},
      visiblePosts: {},
      isUploadVisible: false,
      isReplyUploadVisible: false
    };
    this.formRef = React.createRef();
    this.replyFormRef = React.createRef();
  }

  handleToggleUpload = () => {
    this.setState({
      isUploadVisible: true
    });
  };

  handleHideUpload = () => {
    this.setState({
      isUploadVisible: false
    });
  };

  handleToggleReplyUpload = () => {
    this.setState({
      isReplyUploadVisible: true
    });
  };

  handleHideReplyUpload = () => {
    this.setState({
      isReplyUploadVisible: false
    });
  };

  handlePostChange = e => {
    this.setState({
      currentPost: e.target.value
    });
  };

  handleFileUpload = () => {
    const form = this.formRef.current;
    const input = form.querySelector("input[type=file]");
    input.click();
  };

  handleFileChange = e => {
    const files = Array.prototype.map.call(e.target.files, f => f);
    this.setState({
      uploadFiles: files
    });
  };

  handleReplyFileChange = e => {
    const postId = this.replyPostId;
    const files = Array.prototype.map.call(e.target.files, f => f);
    const { replyUploadFiles } = this.state;
    replyUploadFiles[postId] = files;

    this.setState({
      replyUploadFiles: { ...replyUploadFiles }
    });
  };

  handleReplyFileUpload = postId => {
    this.replyPostId = postId;
    this.handleToggleReplyUpload();
  };

  handleKeyPress = e => {
    if (e.charCode === 13) {
      this.handleSend(e);
    }
  };

  handleSend = e => {
    const { onSend } = this.props;
    const { uploadFiles } = this.state;
    const originFiles = uploadFiles.map(f => f.originFileObj);
    const { target } = e;
    let value;
    if (target.tagName === "INPUT") {
      value = target.value;
    } else {
      value = target.closest("svg").parentElement.previousSibling.value;
    }

    onSend(value, originFiles).then(() => {
      this.setState({
        currentPost: "",
        uploadFiles: []
      });
    });
  };

  handlePostReply = postId => {
    const newState = { ...this.state };
    const postRepliesVisible = { ...newState.postRepliesVisible };
    postRepliesVisible[postId] = !postRepliesVisible[postId];
    this.setState({ ...newState, postRepliesVisible });
  };

  handleReplyChange = (e, postId) => {
    const newState = { ...this.state };
    newState.postReplies = { ...newState.postReplies };
    newState.postReplies[postId] = e.target.value;
    this.setState(newState);
  };

  handleReplyKeyPress = (e, post) => {
    if (e.charCode === 13) {
      this.handleReplySend(e, post);
    }
  };

  handleReplySend = (e, post) => {
    const { target } = e;
    let value;

    if (target.tagName === "INPUT") {
      value = target.value;
    } else {
      value = target.closest("svg").parentElement.previousSibling.value;
    }

    const { onReplySend } = this.props;
    const uploadFiles = this.state.replyUploadFiles[post.id];

    const originFiles = uploadFiles && uploadFiles.map(f => f.originFileObj);
    onReplySend(value, post, originFiles).then(() => {
      const postReplies = { ...this.state.postReplies };
      const replyUploadFiles = { ...this.state.replyUploadFiles };

      postReplies[post.id] = "";
      replyUploadFiles[post.id] = [];

      this.setState({
        postReplies,
        replyUploadFiles
      });
    });
  };

  handleShowMorePosts = (id, posts) => {
    const { visiblePosts } = this.state;
    const visibleForParent = visiblePosts[id];
    if (visibleForParent < posts.length) {
      visiblePosts[id] += 5;
    }

    this.setState({
      visiblePosts: { ...visiblePosts }
    });
  };

  handleChangeUpload = filesList => {
    this.setState({
      uploadFiles: filesList
    });
  };

  handleChangeReplyUpload = filesList => {
    const { replyUploadFiles } = this.state;
    replyUploadFiles[this.replyPostId] = filesList;

    this.setState({
      replyUploadFiles: { ...replyUploadFiles }
    });
  };

  // RENDERS
  renderUploadFiles() {
    const { uploadFiles } = this.state;

    return (
      <>
        <div className="conversation__upload-files">
          {uploadFiles.map(file => {
            const { originFileObj } = file;
            return <div key={originFileObj.name}>{originFileObj.name}</div>;
          })}
        </div>
      </>
    );
  }

  renderReplyUploadFiles(postId) {
    const { replyUploadFiles } = this.state;
    const files = replyUploadFiles[postId];
    return (
      <div className="conversation__upload-files">
        {files &&
          files.map(file => {
            const { originFileObj } = file;
            return <div key={originFileObj.name}>{originFileObj.name}</div>;
          })}
      </div>
    );
  }

  renderPostReply = post => {
    const { avatar } = this.props;
    const { postReplies } = this.state;
    const reply = postReplies[post.id];

    return (
      <div className="group__post-form-container">
        <div className="group__post-form">
          <Input
            style={{ marginBottom: "8px" }}
            value={reply}
            placeholder="Написать комментарий"
            onKeyPress={e => this.handleReplyKeyPress(e, post)}
            onChange={e => this.handleReplyChange(e, post.id)}
            suffix={
              <>
                <UploadIcon
                  onClick={() => this.handleReplyFileUpload(post.id)}
                  style={{ marginRight: "12px" }}
                />
                <SendIcon
                  style={{ cursor: "pointer" }}
                  onClick={e => this.handleReplySend(e, post)}
                />
              </>
            }
          />
        </div>
        {this.renderReplyUploadFiles(post.id)}
      </div>
    );
  };

  renderPostImageFiles(post) {
    const { files } = post;
    const imageFiles = files.filter(
      f =>
        f.name.endsWith("jpg") ||
        f.name.endsWith("jpeg" || f.name.endsWith("png"))
    );
    return (
      <div className="group__post-image-files">
        {imageFiles.map(imageFile => (
          <div key={imageFile.name}>
            <img className="group__post-image-file" src={imageFile.name} />
          </div>
        ))}
      </div>
    );
  }

  renderPostFiles(post) {
    const { files } = post;
    return (
      <div className="group__post-files">
        {files &&
          files.map(f => {
            const fileSize = f.size && prettyBytes(f.size, { locale: "ru" });
            return (
              <div key={f.name} className="group__post-file">
                <a download href={f.name} style={{ display: "block" }}>
                  <Icon
                    type={getFileIcon(f.name)}
                    style={{ fontSize: "32px" }}
                  />
                </a>

                <div className="group__post-file-details">
                  <div className="group__post-file-name">
                    {getFileName(f.name)}
                  </div>
                  <div className="group__post-file-size">{fileSize}</div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  renderPost(post, level, parentPost, isFirstLevel) {
    const { currentPost, postRepliesVisible } = this.state;
    const date = moment(post.createdAt).fromNow();
    const postId = `post_${post.id}`;
    const parentPostId = `#post_${post.parentId}`;
    const parentDate = parentPost && moment(parentPost.createdAt).fromNow();
    const postChildrenCount = (post.children && post.children.length) || 0;
    const postCls = cn("group__post", {
      group__post_child: !!parentPost
    });
    const { visiblePosts } = this.state;
    const hasMorePosts =
      isFirstLevel && visiblePosts[post.id] < post.children.length;

    return (
      <div key={post.id} id={postId}>
        <div className={postCls} style={{ paddingLeft: `${level}px` }}>
          <div className="group__post-header">
            <div style={{ display: "flex" }}>
              <div className="group__post-avatar">
                <img src={post.avatar} alt="post user" />
              </div>
              <div style={{ marginLeft: "10px" }}>
                <div className="group__post-user">{post.userName}</div>
                <div className="group__post-position">{date}</div>
              </div>
            </div>
          </div>
          <div className="group__post-body">
            <div className="group__post-text">{post.text}</div>
          </div>
          {this.renderPostImageFiles(post)}
          {this.renderPostFiles(post)}
          <div className="group__post-footer">
            <div>
              {
                <span
                  className="group__post-reply"
                  onClick={() => this.handlePostReply(post.id)}
                >
                  Ответить
                </span>
              }
            </div>
          </div>
          {postRepliesVisible[post.id] && (
            <div>{this.renderPostReply(post)}</div>
          )}
          {post.children &&
            this.renderPosts(post.children, level + LEVEL_PADDING, post)}
          {hasMorePosts && (
            <div
              className="group__post-show-more"
              onClick={() =>
                this.handleShowMorePosts(post.id, post && post.children)
              }
            >
              Показать следующие комментарии
            </div>
          )}
        </div>
      </div>
    );
  }

  renderConversationForm() {
    const { avatar } = this.props;
    const { currentPost } = this.state;
    return (
      <div className="group__post-form-container">
        <div className="group__post-form">
          <Input
            value={currentPost}
            placeholder="Написать комментарий"
            onKeyPress={this.handleKeyPress}
            onChange={this.handlePostChange}
            suffix={
              <>
                <UploadIcon
                  onClick={this.handleToggleUpload}
                  style={{ marginRight: "12px" }}
                />
                <SendIcon
                  style={{ cursor: "pointer" }}
                  onClick={this.handleSend}
                />
              </>
            }
          />
        </div>
        {this.renderUploadFiles()}
      </div>
    );
  }

  renderPosts(posts, level, parentPost, isFirstLevel) {
    const { visiblePosts } = this.state;
    let postsToShow;

    if (parentPost) {
      visiblePosts[parentPost.id] = visiblePosts[parentPost.id] || 5;
      postsToShow = posts.slice(0, visiblePosts[parentPost.id]);
    } else {
      postsToShow = posts;
    }

    return (
      <div>
        {postsToShow.map(post =>
          this.renderPost(post, level, parentPost, isFirstLevel)
        )}
      </div>
    );
  }

  render() {
    const { posts } = this.props;
    const {
      isUploadVisible,
      uploadFiles,
      isReplyUploadVisible,
      replyUploadFiles
    } = this.state;

    return (
      <div className="group__posts">
        {!this.props.hideForm && this.renderConversationForm()}
        {this.renderPosts(posts, 0, undefined, true)}
        <UploadWindow
          value={uploadFiles}
          visible={isUploadVisible}
          onCancel={this.handleHideUpload}
          onOk={this.handleHideUpload}
          onChange={this.handleChangeUpload}
        />
        <UploadWindow
          value={replyUploadFiles[this.replyPostId] || []}
          visible={isReplyUploadVisible}
          onCancel={this.handleHideReplyUpload}
          onOk={this.handleHideReplyUpload}
          onChange={this.handleChangeReplyUpload}
        />
      </div>
    );
  }
}

export default GroupPosts;
