import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "antd";
import "./Group.less";
import { Actions } from "jumpstate";

class Group extends Component {
  static defaultProps = {
    group: {}
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    const { userId } = this.props;
    Actions.getProjectGroup({ id, userId });
  }

  handleUnsubscribe = () => {
    const { userId } = this.props;
    const { id } = this.props.group;
    Actions.postUnsubscribeGroup({ groupId: id, userId });
  };

  handleSubscribe = () => {
    const { userId } = this.props;
    const { id } = this.props.group;
    Actions.postSubscribeGroup({ groupId: id, userId });
  };

  renderIsOpen(isOpen) {
    return isOpen ? "Открытая группа" : "Закрытая группа";
  }

  renderConversations2(conversations = []) {
    const { id } = this.props.match.params;
    return (
      <div className="group__discussions-container">
        <div className="group__title_small">Обсуждения</div>
        <div className="group__discussions">
          {conversations.map(conversation => {
            const link = `${id}/conversation/${conversation.id}`;
            return (
              <div className="group__discusstion" key={conversation.id}>
                <div className="group__discussion-title">
                  <Link to={link}>{conversation.title}</Link>
                </div>
                <div className="group__discussion-info">
                  <div className="group__text_small">
                    {conversation.count} постов &nbsp;
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  render2() {
    const { title, avatar, isOpen, conversations, description } =
      this.props.group || {};

    return (
      <div className="group">
        <div className="group__info-container">
          <div className="group__avatar">
            <img src={avatar} alt={title} />
          </div>
          <div className="group__info">
            <div className="group__text">{this.renderIsOpen(isOpen)}</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div className="group__title">{title}</div>
              <span>Вы участник</span>
            </div>
            <hr />
            <div className="group__text">О группе</div>
            <div className="group__text_small">{description}</div>
          </div>
        </div>
        {this.renderConversations(conversations)}
        <div className="groups__feed" />
      </div>
    );
  }

  renderConversations(conversations = []) {
    return (
      <div className="group__conversations">
        {conversations.map(this.renderConversation)}
      </div>
    );
  }

  renderConversation = conversation => {
    const { id } = this.props.match.params;
    const { userId } = this.props;

    const link = `${id}/conversation/${conversation.id}`;
    return (
      <div className="group__conversation">
        <div className="group__conversation-title">
          <Link to={link}>{conversation.title}</Link>
        </div>
        <div className="group__conversation-badge">
          {conversation.count} &nbsp; постов
        </div>
      </div>
    );
  };

  renderJoinButton = () => {
    return <Button onClick={this.handleSubscribe}>Присоединиться</Button>;
  };

  renderLeaveButton = () => {
    return (
      <Button
        className="project-group__leave-button"
        onClick={this.handleUnsubscribe}
      >
        Покинуть группу
      </Button>
    );
  };

  render() {
    const { title, avatar, isOpen, conversations, description, participant } =
      this.props.group || {};

    return (
      <div className="group">
        <div className="group__header">
          <div className="group__title">{title}</div>
          <div>
            <div>
              <div />
            </div>
            {participant ? this.renderLeaveButton() : this.renderJoinButton()}
            <Button icon="bell" style={{ marginLeft: "8px" }} />
          </div>
        </div>

        {this.renderConversations(conversations)}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    group: state.ProjectGroup.group,
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(Group);
