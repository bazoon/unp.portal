import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import moment from "moment";
import { Input, Tooltip, Icon, Button } from "antd";
import prettyBytes from "pretty-bytes";
import "./Conversation.less";

const { TextArea } = Input;

class Conversation extends Component {
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

  componentDidMount = () => {
    const { conversationId } = this.props.match.params;
    Actions.getConversation(conversationId);
  };

  handleKeyPress = e => {
    if (e.charCode === 13) {
      this.handleSend(e.target.value);
    }
  };

  handleReplyKeyPress = (e, postId) => {
    if (e.charCode === 13) {
      this.handleReplySend(e.target.value, postId);
    }
  };

  handleSend = text => {
    const { conversationId } = this.props.match.params;
    const { userId } = this.props;

    const { uploadFiles } = this.state;
    const formData = new FormData();
    formData.append("conversationId", conversationId);
    formData.append("userId", userId);
    formData.append("text", text);
    uploadFiles.forEach(f => {
      formData.append("file", f);
    });

    Actions.sendConversationPost({ conversationId, formData })
      .then(() => {
        this.setState({
          currentPost: ""
        });
      })
      .then(() => {
        this.setState({
          uploadFiles: []
        });
      });
  };

  handleReplySend = (comment, postId) => {
    const { userId } = this.props;
    const { replyUploadFiles } = this.state;
    const files = replyUploadFiles[postId] || [];

    const formData = new FormData();

    formData.append("postId", postId);
    formData.append("userId", userId);
    formData.append("comment", comment);

    files.forEach(f => {
      formData.append("file", f);
    });

    Actions.sendPostReply({ postId, formData }).then(() => {
      const postReplies = { ...this.state.postReplies };
      const replyUploadFiles = { ...this.state.replyUploadFiles };

      postReplies[postId] = "";
      replyUploadFiles[postId] = [];

      this.setState({
        postReplies,
        replyUploadFiles
      });
    });
  };

  handlePostChange = e => {
    this.setState({
      currentPost: e.target.value
    });
  };

  handleReplyChange = (e, postId) => {
    const newState = { ...this.state };
    newState.postReplies = { ...newState.postReplies };
    newState.postReplies[postId] = e.target.value;
    this.setState(newState);
  };

  handlePostReply = postId => {
    const newState = { ...this.state };
    const postRepliesVisible = { ...newState.postRepliesVisible };
    postRepliesVisible[postId] = !postRepliesVisible[postId];
    this.setState({ ...newState, postRepliesVisible });
  };

  loadComments = postId => {
    Actions.getComments(postId);
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

  renderComments = postId => {
    const { postComments } = this.props;
    const comments = postComments[postId] || [];
    return comments.map(comment => {
      return (
        <div key={comment.id} className="conversation__post-comment">
          <div style={{ display: "flex" }}>
            <img src={comment.avatar} alt="avatar" />
            <div>{comment.userName}</div>
          </div>
          <div className="conversation__post-comment-text">
            {comment.comment}
          </div>
          {this.renderCommentFiles(comment)}
        </div>
      );
    });
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

  renderCommentFiles(comment) {
    const { files } = comment;
    return (
      <div className="conversation__post-files">
        {files &&
          files.map(f => {
            const downloadUrl = `/uploads/${f.name}`;
            const fileSize = prettyBytes(f.size, { locale: "ru" });
            return (
              <div key={f.name} className="conversation__post-comment-file">
                <a download href={downloadUrl} style={{ display: "block" }}>
                  <Icon
                    type={this.getFileIcon(f.name)}
                    style={{ fontSize: "16px", marginRight: "5px" }}
                  />
                </a>

                <div className="conversation__post-comment-file-details">
                  <div className="conversation__post-comment-file-name">
                    {f.name}
                  </div>
                  <div className="conversation__post-comment-file-size">
                    {fileSize}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  render() {
    const { conversationId } = this.props.match.params;
    const { avatar, postComments } = this.props;
    const { currentPost, postRepliesVisible } = this.state;

    const posts =
      (this.props.conversations &&
        this.props.conversations[conversationId] &&
        this.props.conversations[conversationId]) ||
      [];
    return (
      <>
        {posts.map(post => {
          const date = moment(post.createdAt).format("D MMMM YYYY HH:mm");
          const comments = postComments[post.id] || [];
          return (
            <div key={post.id} className="conversation__container">
              <div className="conversation__post">
                <div className="conversation__post-header">
                  <div style={{ display: "flex" }}>
                    <div className="conversation__post-avatar">
                      <img src={post.avatar} alt="post user" />
                    </div>
                    <div style={{ marginLeft: "10px" }}>
                      <div className="conversation__post-user">
                        {post.userName}
                      </div>
                      <div className="conversation__post-position">
                        {post.position}
                      </div>
                    </div>
                  </div>
                  <div className="conversation__post-date">{date}</div>
                </div>

                <div className="conversation__post-body">
                  <div className="conversation__post-text">{post.text}</div>
                </div>
                {this.renderPostFiles(post)}
                <div className="conversation__post-comments">
                  {this.renderComments(post.id)}
                </div>
                <div className="conversation__post-footer">
                  <Button
                    size="small"
                    onClick={() => this.handlePostReply(post.id)}
                  >
                    Ответить
                  </Button>
                  <div className="conversation__post-favorite">
                    <Icon type="star" />
                    <div>Сохранить в закладки</div>
                  </div>
                  <div className="conversation__post-toggle-comment">
                    {!comments || comments.length === 0 ? (
                      <div onClick={() => this.loadComments(post.id)}>
                        Комментариев &nbsp;
                        {post.commentsCount}
                      </div>
                    ) : (
                      <div>
                        Комментариев &nbsp;
                        {comments && comments.length}
                      </div>
                    )}
                  </div>
                </div>
                {postRepliesVisible[post.id] && (
                  <div>{this.renderPostReply(post.id)}</div>
                )}
              </div>
            </div>
          );
        })}
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

const mapStateToProps = state => {
  return {
    conversations: state.Conversation.conversations,
    avatar: state.Login.avatar,
    userId: state.Login.userId,
    postComments: state.Conversation.posts
  };
};

export default connect(mapStateToProps)(Conversation);
