import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import PropTypes from "prop-types";
import { Button, Input, Icon, Avatar, Upload, Select } from "antd";
import api from "../../api/api";
import "./Feed.less";
import Posts from "../Conversation/Posts";

const { TextArea } = Input;
const Option = Select.Option;

class Feed extends Component {
  static propTypes = {
    posts: PropTypes.arrayOf(PropTypes.object),
    recipients: PropTypes.arrayOf(PropTypes.object),
    userId: PropTypes.string.isRequired
  };

  static defaultProps = {
    posts: [],
    recipients: []
  };

  constructor(props) {
    super(props);
    this.state = {
      visibleComments: {},
      currentComment: {},
      chosenRecipients: [],
      message: ""
    };
  }

  componentDidMount = () => {
    const { userId } = this.props;
    this.getFeed(userId);
  };

  getFeed(userId) {
    Actions.getRecipients(userId);
    Actions.getGroupPosts(userId);
  }

  toggleComments = id => {
    const { visibleComments } = this.state;
    const newVisibleComments = {
      ...visibleComments,
      [id]: !visibleComments[id]
    };
    this.setState({
      visibleComments: newVisibleComments
    });
  };

  postComment = (e, id) => {
    if (e.charCode === 13) {
      const payload = { text: e.target.value, id };
      api.post("api/feed/comment", payload).then(() => {
        this.getFeed();
        this.setState({
          currentComment: { ...this.state.currentComment, [id]: "" }
        });
      });
    }
  };

  handleChangeComment = (e, id) => {
    const { currentComment } = this.state;
    const newCurrentComment = {
      ...currentComment,
      [id]: e.target.value
    };
    this.setState({
      currentComment: newCurrentComment
    });
  };

  handleSend = (text, uploadFiles) => {};

  handleReplySend = (text, post, files = []) => {
    const { userId } = this.props;
    const formData = new FormData();
    formData.append("postId", post.id);
    formData.append("conversationId", post.cid);
    formData.append("userId", userId);
    formData.append("text", text);
    files.forEach(f => {
      formData.append("file", f);
    });

    return Actions.postReplyToFeed({ userId, payload: formData });
  };

  handleMessageFilesChanged = info => {
    this.setState({
      messageFiles: info.fileList
    });
  };

  handleRecipientChange = value => {
    this.setState({
      chosenRecipients: value
    });
  };

  handleChangeMessage = e => {
    this.setState({
      message: e.target.value
    });
  };

  handleSendMessage = () => {
    const { userId } = this.props;
    const { chosenRecipients, message } = this.state;
    const { messageFiles } = this.state;

    const groupKeys = chosenRecipients.map(r => r.split(":")[0].split("-"));
    const config = {
      groups: groupKeys
    };

    const formData = new FormData();
    formData.append("to", JSON.stringify(config));
    formData.append("message", message);
    formData.append("userId", userId);

    messageFiles.forEach(f => {
      formData.append("file", f.originFileObj);
    });

    Actions.postToFeed({ userId, payload: formData }).then(() => {
      this.handleCancelMessage();
    });
  };

  handleCancelMessage = () => {
    this.setState({
      message: "",
      chosenRecipients: [],
      messageFiles: []
    });
  };

  // RENDERS

  renderComments = (id, comments = []) => {
    const { visibleComments, currentComment } = this.state;
    if (!visibleComments[id]) return null;
    const renderedComments = comments.map(comment => {
      return (
        <div key={comment.id} className="feed__item-comment">
          <div className="feed__item-comment-avatar">
            <img src={comment.avatar} alt="comment avatar" />
          </div>
          <div className="feed__item-comment-content">
            <div className="feed__item-comment-author">{comment.author}</div>
            <div className="feed__item-comment-text">{comment.text}</div>
          </div>
        </div>
      );
    });
    return (
      <React.Fragment>
        {renderedComments}
        <Input
          value={currentComment[id]}
          onChange={e => this.handleChangeComment(e, id)}
          placeholder="написать сообщение"
          onKeyPress={e => this.postComment(e, id)}
        />
      </React.Fragment>
    );
  };

  renderItem = item => {
    return (
      <div className="feed__item" key={item.id}>
        <div className="feed__item-header">
          <div>
            <div className="feed__item-who">{item.who}&nbsp;&nbsp;</div>
            <div>⟶&nbsp;&nbsp;</div>
            <div>Всем сотрудникам</div>
          </div>
          <div>
            <Button icon="more" />
          </div>
        </div>
        <div className="feed__item-date">
          {moment(item.date).format("DD.MM.YYYY")}
        </div>
        <div className="feed__item-text">{item.text}</div>
        <div className="feed__item-avatar">
          <img src={item.avatar} alt="logo" />
        </div>
        <div className="feed__item-footer">
          <Icon type="like" />
          <div
            className="feed__item-comments-button"
            onClick={() => this.toggleComments(item.id)}
          >
            Комментарии
          </div>
        </div>
        <hr />
        <div className="feed__item-comments">
          {this.renderComments(item.id, item.comments)}
        </div>
      </div>
    );
  };

  render() {
    const { posts, avatar, recipients } = this.props;
    const { message } = this.state;

    const suggestions = recipients.map(suggestion => {
      const title = `${suggestion.title}-${suggestion.ctitle}`;
      const key = `${suggestion.id}-${suggestion.cid}:${title}`;
      return <Option key={key}>{title}</Option>;
    });

    return (
      <div className="feed">
        <div className="feed__header">Новости</div>
        <hr />
        <div className="feed-message">
          <TextArea
            placeholder="Текст сообщения"
            autosize={{ minRows: 2, maxRows: 6 }}
            onChange={this.handleChangeMessage}
            value={message}
          />
        </div>
        <div className="feed-whom">
          Кому&nbsp;
          <Select
            style={{ width: "100%" }}
            mode="multiple"
            onChange={this.handleRecipientChange}
            value={this.state.chosenRecipients}
          >
            {suggestions}
          </Select>
        </div>
        <br />
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between"
          }}
        >
          <Upload
            onChange={this.handleMessageFilesChanged}
            multiple
            fileList={this.state.messageFiles}
            beforeUpload={() => false}
          >
            <Button>
              <Icon type="upload" />
              Файлы
            </Button>
          </Upload>
          <div>
            <Button onClick={this.handleCancelMessage}>Отменить</Button>
            <Button onClick={this.handleSendMessage}>Отправить</Button>
          </div>
        </div>

        <br />
        <Posts
          posts={posts}
          avatar={avatar}
          onSend={this.handleSend}
          onReplySend={this.handleReplySend}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    posts: state.Feed.posts,
    recipients: state.Feed.recipients,
    userId: state.Login.userId,
    avatar: state.Login.avatar
  };
};

export default connect(mapStateToProps)(Feed);
