import React, { Component } from "react";
import { connect } from "react-redux";
import { Input, Layout, Breadcrumb, Col, Row, Button, Icon } from "antd";
import { ProjectGroup } from "../ProjectGroups/ProjectGroup";
import { Actions } from "jumpstate";
import { pluralizeComments } from "../../utils/pluralize";
import Posts from "./GroupPosts";
import { Link } from "react-router-dom";
import moment from "moment";
import ConversationModal from "./Conversation/ConversationModal";
import ChatWaitIcon from "../../../images/chat_wait";
import RightIcon from "../../../images/arrow_right";
import UpIcon from "../../../images/arrow_up";
import JoinButton from "../ProjectGroups/JoinButton";
import LeaveButton from "../ProjectGroups/LeaveButton";
import Participants from "./Participants";
import FileIcon from "../../../images/file";
import { pluralizeFiles } from "../../utils/pluralize";
import cn from "classnames";

const maxDescriptionSentences = 10;

class GroupFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConversationModalVisible: false,
      isShortMode: true,
      isTitleOver: false
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    Actions.getProjectGroup({ id });
    Actions.getOwnGroupPosts(id);
  }

  handleCreateConversation = () => {
    this.setState({
      isConversationModalVisible: true
    });
  };

  handleCancel = () => {
    this.setState({
      isConversationModalVisible: false
    });
  };

  handleOk = () => {
    this.setState({
      isConversationModalVisible: false
    });
  };

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

  handleToggleMore = () => {
    this.setState({
      isShortMode: !this.state.isShortMode
    });
  };

  handleSubscribe = () => {
    const { id } = this.props.group;
    Actions.postSubscribeGroup({ groupId: id });
  };

  handleUnsubscribe = () => {
    const { id } = this.props.group;
    Actions.postUnsubscribeGroup({ groupId: id });
  };

  handleTitleOver = () => {
    this.setState({
      isTitleOver: true
    });
  };

  handleTitleOut = () => {
    this.setState({
      isTitleOver: false
    });
  };

  renderAddRegion() {
    return (
      <div
        className="group__add-region"
        onClick={this.handleCreateConversation}
      >
        Добавить запись в группе
      </div>
    );
  }

  renderConversations() {
    const { id, conversations } = this.props.group;

    return (
      <div className="group__conversations">
        {conversations.map(conversation => {
          const date = moment(conversation.created_at).fromNow();
          const link = `${id}/conversation/${conversation.id}`;
          return (
            <div key={conversation.id} className="group__conversation">
              <div className="group__conversation-header">
                <div className="group__conversation-user">
                  Написал &nbsp; {conversation.name}
                </div>
                <div className="group__conversation-date">{date}</div>
              </div>
              <div className="group__conversation-title">
                {conversation.title}
              </div>
              <div className="group__conversation-description">
                {conversation.description}
              </div>
              <div className="group__conversation-footer">
                <ChatWaitIcon
                  style={{ marginRight: "8px" }}
                  className="svg-icon"
                />

                <Link to={link}>{pluralizeComments(conversation.count)}</Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  renderRestDescription(description) {
    return <div className="group__feed-rest-description">{description}</div>;
  }

  renderFiles() {
    const { files } = this.props.group;
    return (
      <div className="group__files">
        <div className="group__files-title">Прикрепленные файлы</div>
        <ul>
          {files.map(file => {
            return (
              <li className="group__file">
                <FileIcon />
                <a download href={file.url}>
                  {file.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  render() {
    const {
      id,
      title,
      avatar,
      description,
      participant,
      participants,
      files
    } = this.props.group;

    const { isShortMode } = this.state;
    const sentences = description && description.split(".");
    const shortDescription =
      sentences && `${sentences.slice(0, maxDescriptionSentences).join(".")}.`;
    const restDescription =
      sentences && `${sentences.slice(maxDescriptionSentences).join(".")}.`;

    const titleCls = cn("group__feed-title", {
      "group__feed-title_over": this.state.isTitleOver
    });

    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/groups">Группы</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row type="flex">
          <Col span={16}>
            <div
              className="group__feed"
              style={{
                backgroundImage: `url(${avatar})`
              }}
            >
              <div className="group__feed-header">
                <div
                  onMouseEnter={this.handleTitleOver}
                  onMouseLeave={this.handleTitleOut}
                  className={titleCls}
                >
                  {title}
                </div>
                <div className="group__feed-description">
                  {shortDescription}
                </div>
                <div className="group__feed-footer">
                  <div
                    className="group__feed-show-link"
                    onClick={this.handleToggleMore}
                  >
                    {isShortMode ? (
                      <span>
                        <RightIcon style={{ marginRight: "4px" }} />
                        Показать больше информации
                      </span>
                    ) : (
                      <span>
                        <UpIcon style={{ marginRight: "4px" }} />
                        Показать меньше информации
                      </span>
                    )}
                  </div>
                  <div className="group__feed-files-info">
                    {pluralizeFiles(files.length)}
                  </div>
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
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

        {!isShortMode && (
          <Row type="flex">
            <Col span={16}>{this.renderRestDescription(restDescription)}</Col>
            <Col span={8}>{this.renderFiles()}</Col>
          </Row>
        )}

        <Row gutter={37}>
          <Col span={16}>
            <div style={{ marginBottom: "40px" }} />
            {this.renderAddRegion()}
            {this.renderConversations()}
            <Posts
              posts={this.props.posts}
              onReplySend={this.handleReplySend}
              onSend={this.handleSend}
            />
          </Col>
        </Row>
        <ConversationModal
          proectGroupId={id}
          visible={this.state.isConversationModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        />
      </>
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
