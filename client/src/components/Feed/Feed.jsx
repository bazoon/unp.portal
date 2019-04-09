import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import { Button, Input, Icon } from "antd";
import api from "../../api/api";
import "./Feed.less";
import Posts from "../Conversation/Posts";

class Feed extends Component {
  static defaultProps = {
    posts: []
  };

  constructor(props) {
    super(props);
    this.state = {
      visibleComments: {},
      currentComment: {}
    };
  }

  componentDidMount = () => {
    this.getFeed();
  };

  getFeed() {
    Actions.getGroupPosts(this.props.userId);
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

  handleReplySend = (comment, postId, replyUploadFiles) => {};

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
    const { posts, avatar } = this.props;
    return (
      <div className="feed">
        <div className="feed__header">Лента</div>
        <hr />
        <Input placeholder="Написать сообщение. Используйте @ чтобы упомянуть конкретные лица" />
        <br />
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
    userId: state.Login.userId,
    avatar: state.Login.avatar
  };
};

export default connect(mapStateToProps)(Feed);
