import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Input, Icon, Button } from "antd";
import { HashLink } from "react-router-hash-link";
import prettyBytes from "pretty-bytes";

class Posts extends Component {
  static propTypes = {
    posts: PropTypes.arrayOf(PropTypes.object).isRequired,
    avatar: PropTypes.string.isRequired,
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
      replyUploadFiles: {}
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

  handleReplyKeyPress = (e, postId) => {
    const { onReplySend } = this.props;

    if (e.charCode === 13) {
      onReplySend(e.target.value, postId, replyUploadFiles).then(() => {
        const postReplies = { ...this.state.postReplies };
        const replyUploadFiles = { ...this.state.replyUploadFiles };

        postReplies[postId] = "";
        replyUploadFiles[postId] = [];

        this.setState({
          postReplies,
          replyUploadFiles
        });
      });
    }
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
    return (
      <div className="conversation__upload-files">
        {uploadFiles.map(file => {
          return <div key={file.name}>{file.name}</div>;
        })}
      </div>
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

  renderPostReply = postId => {
    const { avatar } = this.props;
    const { postReplies } = this.state;
    const reply = postReplies[postId];

    return (
      <div className="conversation__form-container">
        <div className="conversation__form">
          <img src={avatar} alt="avatar" />
          <Icon
            type="paper-clip"
            style={{
              fontSize: "16px",
              color: "#00ccff",
              marginRight: "5px",
              cursor: "pointer"
            }}
            onClick={() => this.handleReplyFileUpload(postId)}
          />
          <Input
            value={reply}
            placeholder="Введите текст"
            onKeyPress={e => this.handleReplyKeyPress(e, postId)}
            onChange={e => this.handleReplyChange(e, postId)}
          />
        </div>
        {this.renderReplyUploadFiles(postId)}
      </div>
    );
  };

  getFileIcon(file) {
    switch (true) {
      case file.endsWith("pdf"):
        return "file-pdf";
      case file.endsWith("jpg"):
      case file.endsWith("jpeg"):
        return "file-jpg";
      case file.endsWith("doc"):
      case file.endsWith("docx"):
        return "file-word";
      case file.endsWith("xls"):
      case file.endsWith("xlsx"):
        return "file-excel";
      default:
        return "file";
    }
  }

  renderPostFiles(post) {
    const { files } = post;
    return (
      <div className="conversation__post-files">
        {files &&
          files.map(f => {
            const downloadUrl = `/uploads/${f.name}`;
            const fileSize = prettyBytes(f.size, { locale: "ru" });
            return (
              <div key={f.name} className="conversation__post-file">
                <a download href={downloadUrl} style={{ display: "block" }}>
                  <Icon
                    type={this.getFileIcon(f.name)}
                    style={{ fontSize: "32px" }}
                  />
                </a>

                <div className="conversation__post-file-details">
                  <div className="conversation__post-file-name">{f.name}</div>
                  <div className="conversation__post-file-size">{fileSize}</div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  renderPost(post, parentPost) {
    const date = moment(post.createdAt).format("D MMMM YYYY HH:mm");
    const { currentPost, postRepliesVisible } = this.state;
    const postId = `post_${post.id}`;
    const parentPostId = `#post_${post.parentId}`;
    return (
      <div key={post.id} id={postId}>
        <div className="conversation__post">
          <div className="conversation__post-header">
            <div style={{ display: "flex" }}>
              <div className="conversation__post-avatar">
                <img src={post.avatar} alt="post user" />
              </div>
              <div style={{ marginLeft: "10px" }}>
                <div className="conversation__post-user">{post.userName}</div>
                <div className="conversation__post-position">
                  {post.position}
                </div>
              </div>
            </div>
            <div className="conversation__post-date">{date}</div>
          </div>
          {parentPost && (
            <div className="conversation__post-parent">
              <div className="conversation__post-parent-text">
                {parentPost.text}
              </div>
              <div className="conversation__post-to-parent">
                <HashLink to={parentPostId}>
                  <div>
                    <Button
                      type="primary"
                      href={`/#${parentPostId}`}
                      shape="circle"
                      icon="caret-up"
                      size="small"
                    />
                  </div>
                </HashLink>
              </div>
            </div>
          )}
          <div className="conversation__post-body">
            <div className="conversation__post-text">{post.text}</div>
          </div>
          {this.renderPostFiles(post)}
          <div className="conversation__post-footer">
            <Button size="small" onClick={() => this.handlePostReply(post.id)}>
              Ответить
            </Button>
            <div className="conversation__post-favorite">
              <Icon type="star" />
              <div>Сохранить в закладки</div>
            </div>
          </div>
          {postRepliesVisible[post.id] && (
            <div>{this.renderPostReply(post.id)}</div>
          )}
        </div>
        {post.children && this.renderPosts(post.children, post)}
      </div>
    );
  }

  renderPosts(posts, parentPost) {
    return <div>{posts.map(post => this.renderPost(post, parentPost))}</div>;
  }

  render() {
    const { posts } = this.props;
    const { currentPost, postRepliesVisible } = this.state;
    const { avatar } = this.props;

    return (
      <>
        {this.renderPosts(posts)}
        <div className="conversation__form-container">
          <div className="conversation__form">
            <img src={avatar} alt="avatar" />
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
            {this.renderReplyFileForm()}
          </div>
          {this.renderUploadFiles()}
        </div>
      </>
    );
  }
}

export default Posts;