import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Input, Icon, Button } from "antd";
import { HashLink } from "react-router-hash-link";
import prettyBytes from "pretty-bytes";
import getFileIcon from "../../utils/getFileIcon";
import cn from "classnames";

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
      visiblePosts: {}
    };
    this.formRef = React.createRef();
    this.replyFormRef = React.createRef();
  }

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
    const form = this.replyFormRef.current;
    const input = form.querySelector("input[type=file]");
    this.replyPostId = postId;
    input.click();
  };

  handleKeyPress = e => {
    const { onSend } = this.props;
    const { uploadFiles } = this.state;
    if (e.charCode === 13) {
      onSend(e.target.value, uploadFiles).then(() => {
        this.setState({
          currentPost: "",
          uploadFiles: []
        });
      });
    }
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
    const { onReplySend } = this.props;
    const files = this.state.replyUploadFiles[post.id];

    if (e.charCode === 13) {
      onReplySend(e.target.value, post, files).then(() => {
        const postReplies = { ...this.state.postReplies };
        const replyUploadFiles = { ...this.state.replyUploadFiles };

        postReplies[post.id] = "";
        replyUploadFiles[post.id] = [];

        this.setState({
          postReplies,
          replyUploadFiles
        });
      });
    }
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

  // RENDERS

  renderFileForm = () => {
    return (
      <form
        action="/upload"
        method="post"
        encType="multipart/form-data"
        ref={this.formRef}
        style={{ display: "none" }}
      >
        <input
          multiple
          type="file"
          name="file"
          onChange={this.handleFileChange}
        />
      </form>
    );
  };

  renderReplyFileForm = () => {
    return (
      <form
        action="/upload"
        method="post"
        encType="multipart/form-data"
        ref={this.replyFormRef}
        style={{ display: "none" }}
      >
        <input
          multiple
          type="file"
          name="file"
          onChange={this.handleReplyFileChange}
        />
      </form>
    );
  };

  renderUploadFiles() {
    const { uploadFiles } = this.state;
    const imageFiles = uploadFiles.filter(
      f => f.endsWith("jpg") || f.endsWith("jpeg")
    );

    return (
      <>
        <div className="group__post-images">
          {imageFiles.map(image => {
            return <img src={image} />;
          })}
        </div>
        <div className="conversation__upload-files">
          {uploadFiles.map(file => {
            return <div key={file.name}>{file.name}</div>;
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
            return <div key={file.name}>{file.name}</div>;
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
          <Icon
            type="paper-clip"
            style={{
              fontSize: "16px",
              color: "#00ccff",
              marginRight: "5px",
              cursor: "pointer"
            }}
            onClick={() => this.handleReplyFileUpload(post.id)}
          />
          <Input
            value={reply}
            placeholder="Введите текст"
            onKeyPress={e => this.handleReplyKeyPress(e, post)}
            onChange={e => this.handleReplyChange(e, post.id)}
          />
        </div>
        {this.renderReplyUploadFiles(post.id)}
      </div>
    );
  };

  renderPostFiles(post) {
    const { files } = post;
    return (
      <div className="group__post-files">
        {files &&
          files.map(f => {
            const downloadUrl = `/uploads/${f.name}`;
            const fileSize = prettyBytes(f.size, { locale: "ru" });
            return (
              <div key={f.name} className="group__post-file">
                <a download href={downloadUrl} style={{ display: "block" }}>
                  <Icon
                    type={getFileIcon(f.name)}
                    style={{ fontSize: "32px" }}
                  />
                </a>

                <div className="group__post-file-details">
                  <div className="group__post-file-name">{f.name}</div>
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
                <div className="group__post-position">{post.position}</div>
              </div>
            </div>
            <div className="group__post_date">{date}</div>
          </div>
          <div className="group__post-body">
            <div className="group__post-text">{post.text}</div>
          </div>
          {this.renderPostFiles(post)}
          <div className="group__post-footer">
            <div>
              <Icon type="message" style={{ marginRight: "8px" }} />
              <span>{postChildrenCount}</span>
              {parentPost && (
                <span
                  className="group__post-reply"
                  onClick={() => this.handlePostReply(post.id)}
                >
                  Ответить
                </span>
              )}
            </div>
            <div>
              <Icon type="heart" style={{ marginRight: "24px" }} />
              <Icon type="eye" />
            </div>
          </div>
          {(!parentPost || postRepliesVisible[post.id]) && (
            <div>{this.renderPostReply(post)}</div>
          )}
          <div className="group__post-footer-line" />
          {post.children && this.renderPosts(post.children, level, post)}
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
          <Icon
            type="paper-clip"
            style={{
              fontSize: "16px",
              color: "#00ccff",
              marginRight: "5px",
              cursor: "pointer"
            }}
            onClick={this.handleFileUpload}
          />
          <Input
            value={currentPost}
            placeholder="Введите текст"
            onKeyPress={this.handleKeyPress}
            onChange={this.handlePostChange}
          />

          {this.renderFileForm()}
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

    return (
      <div className="group__posts">
        {this.renderConversationForm()}
        {this.renderPosts(posts, 24, undefined, true)}
        {this.renderReplyFileForm()}
      </div>
    );
  }
}

export default GroupPosts;
