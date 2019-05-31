import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Input,
  Layout,
  Breadcrumb,
  Col,
  Row,
  Button,
  Icon,
  Carousel,
  Popover
} from "antd";
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
import RequestButton from "../ProjectGroups/RequestButton";
import Participants from "./Participants";
import FileIcon from "../../../images/file";
import { pluralizeFiles } from "../../utils/pluralize";
import cn from "classnames";
import SelectBgIcon from "../../../images/selectBg";
import BackgroundSlider from "./BackgroundSlider";
import EditIcon from "../../../images/edit";
import DoneEditIcon from "../../../images/done-edit";
import ConversationForm from "./Conversation/ConversationForm";
import Files from "./Files";
import MoreIcon from "../../../images/more";
import ChatIcon from "../../../images/chat";

const maxDescriptionSentences = 10;

class GroupFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConversationModalVisible: false,
      isShortMode: true,
      isTitleOver: false,
      isTitleEditing: false,
      isShortDescriptionEditing: false
    };
    this.editingFields = {};
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    Actions.getProjectGroup({ id });
    Actions.getOwnGroupPosts(id);
    Actions.getProjectGroupsBackgrounds();
  }

  componentWillUnmount() {
    document.body.removeEventListener("click", this.handleOutTitleClick);
    document.body.removeEventListener("click", this.handleOutTitleClick);
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

  handleSelectBackground = backgroundId => {
    const { id } = this.props.group;
    Actions.postUpdateBackground({ groupId: id, backgroundId });
  };

  handleOutTitleClick = e => {
    if (!e.target.closest(".group__feed-title")) {
      this.handleCancelEditTitle();
    }
  };

  handleEditTitle = () => {
    this.setState({
      isTitleEditing: true
    });

    document.body.addEventListener("click", this.handleOutTitleClick);
  };

  handleDoneEditTitle = () => {
    const { id } = this.props.group;
    if (this.editingFields.title) {
      Actions.postUpdateProjectGroupTitle({
        groupId: id,
        title: this.editingFields.title
      });
    }
    this.handleCancelEditTitle();
  };

  handleCancelEditTitle = () => {
    this.setState({
      isTitleEditing: false
    });

    document.body.removeEventListener("click", this.handleOutTitleClick);
  };

  handleOutShortDescriptionClick = e => {
      this.handleCancelEditShortDescription();
    }
  };

  handleEditShortDescription = () => {
    this.setState({
      isShortDescriptionEditing: true
    });

    this.shortDescriptionEditCancel = document.body.addEventListener(
      "click",
      this.handleOutShortDescriptionClick
    );
  };

  handleDoneEditShortDescription = () => {
    const { id } = this.props.group;
    if (this.editingFields.shortDescription) {
      Actions.postUpdateProjectGroupShortDescription({
        groupId: id,
        shortDescription: this.editingFields.shortDescription
      });
    }
    this.handleCancelEditShortDescription();
  };

  handleCancelEditShortDescription = () => {
    this.setState({
      isShortDescriptionEditing: false
    });

    document.body.removeEventListener(
      "click",
      this.handleOutShortDescriptionClick
    );
  };

    this.editingFields = {
      [field]: e.target.value
    };
  };

  handlePin = conversationId => {
    Actions.postPinConversation({ conversationId });
  };

  handleUnpin = conversationId => {
    Actions.postUnpinConversation({ conversationId });
  };

  renderAddRegion() {
    return (
      <div
        className="group__add-region"
        onClick={this.handleCreateConversation}
      >
        Добавить обсуждение в группе
      </div>
    );
  }

  renderConversationMenu(id, isPinned) {
    return (
      <>
        {isPinned ? (
          <div
            style={{ cursor: "pointer" }}
            onClick={() => this.handleUnpin(id)}
          >
            Открепить
          </div>
        ) : (
          <div style={{ cursor: "pointer" }} onClick={() => this.handlePin(id)}>
            Закрепить
          </div>
        )}
      </>
    );
  }

  renderConversations() {
    const { id, conversations } = this.props.group;

    if (conversations.length === 0) {
      return (
        <div className="group__conversations">
          <div className="group__conversations-empty">Записей пока нет</div>
        </div>
      );
    }

    return (
      <div className="group__conversations">
        {conversations.map(conversation => {
          const date = moment(conversation.createdAt).fromNow();
          const link = `${id}/conversation/${conversation.id}`;
          return (
            <div key={conversation.id} className="group__conversation">
              <div className="group__conversation-header">
                <div style={{ display: "flex" }}>
                  <div className="group__conversation-user">
                    Написал &nbsp; {conversation.name}
                  </div>
                  <div className="group__conversation-date">{date}</div>
                </div>

                <Popover
                  placement="bottom"
                  content={this.renderConversationMenu(
                    conversation.id,
                    conversation.isPinned
                  )}
                  trigger="click"
                >
                  <div style={{ cursor: "pointer" }}>
                    <MoreIcon style={{ cursor: "pointer" }} />
                  </div>
                </Popover>
              </div>
              <div className="group__conversation-title">
                <Link to={link}>{conversation.title}</Link>
              </div>
              <div className="group__conversation-description">
                {conversation.description}
              </div>
              <div className="group__conversation-footer">
                {conversation.isCommentable && (
                  <>
                    <ChatWaitIcon
                      style={{ marginRight: "8px" }}
                      className="svg-icon"
                    />
                    <Link to={link}>
                      {pluralizeComments(conversation.count)}
                    </Link>
                  </>
                )}
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
    return (
      <div className="group__files">
        <div className="group__files-title">Прикрепленные файлы</div>
        <Files files={this.props.group.files} />
      </div>
    );
  }

  renderLeaveButton(id) {
    return (
      <LeaveButton
        style={{ width: "100%" }}
        groupId={id}
        onClick={this.handleUnsubscribe}
      />
    );
  }

  renderJoinButton(id) {
    return (
      <JoinButton
        style={{ width: "100%" }}
        groupId={id}
        onClick={this.handleSubscribe}
      />
    );
  }

  renderRequestButton(id) {
    return (
      <RequestButton
        style={{ width: "100%" }}
        groupId={id}
        onClick={this.handleSubscribe}
      />
    );
  }

  renderBgList = () => {
    const { backgrounds } = this.props;
    return (
      <div>
        {backgrounds.map(bg => {
          return (
            <div>
              <img
                style={{ width: "60px", height: "60px" }}
                alt={bg.id}
                key={bg.id}
                className="group__feed-background"
                src={bg.background}
              />
            </div>
          );
        })}
      </div>
    );
  };

  renderPinnedConversations = () => {
    const { id, conversations } = this.props.group;
    const pinned = conversations.filter(c => c.isPinned);

    return (
      <div className="group__pinned">
        <div className="group__pinned-title">Закрепленные обсуждения</div>
        <ul style={{ padding: 0 }}>
          {pinned.map(conversation => {
            const url = `/groups/${id}/conversation/${conversation.id}`;
            return (
              <li key={conversation.id} className="group__pinned-name">
                <ChatIcon />
                <Link to={url}>{conversation.title}</Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  renderTitleEditControls(title) {
    const { isTitleEditing } = this.state;
    return (
      <>
        {isTitleEditing ? (
          <Input.TextArea
            className="group__feed-title-editor"
            defaultValue={title}
            rows={2}
            onChange={e => this.handleChangeField("title", e)}
          />
        ) : (
          title
        )}
        {isTitleEditing ? (
          <DoneEditIcon onClick={this.handleDoneEditTitle} />
        ) : (
          <EditIcon onClick={this.handleEditTitle} />
        )}
      </>
    );
  }

  renderShortDescriptionControls(shortDescription) {
    const { isShortDescriptionEditing } = this.state;
    return (
      <>
        {isShortDescriptionEditing ? (
          <Input.TextArea
            className="group__feed-description-editor"
            defaultValue={shortDescription}
            rows={7}
            onChange={e => this.handleChangeField("shortDescription", e)}
          />
        ) : (
          shortDescription
        )}
        {isShortDescriptionEditing ? (
          <DoneEditIcon onClick={this.handleDoneEditShortDescription} />
        ) : (
          <EditIcon onClick={this.handleEditShortDescription} />
        )}
      </>
    );
  }

  renderBgSelect() {
    return (
      <>
        <Popover
          placement="bottom"
          content={
            <BackgroundSlider
              onSelect={this.handleSelectBackground}
              backgrounds={this.props.backgrounds}
            />
          }
          trigger="click"
        >
          <div
            style={{
              width: "48px",
              height: "40px",
              position: "relative"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#000",
                opacity: "0.4",
                borderRadius: "8px"
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: "16px",
                height: "16px"
              }}
            >
              <SelectBgIcon />
            </div>
          </div>
        </Popover>
      </>
    );
  }

  render() {
    const {
      id,
      title,
      avatar,
      description,
      shortDescription,
      participant,
      participants,
      files,
      isOpen,
      isAdmin
    } = this.props.group;

    const { isShortMode } = this.state;

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
                  {isAdmin ? this.renderTitleEditControls(title) : title}
                </div>
                <div className="group__feed-description">
                  {isAdmin
                    ? this.renderShortDescriptionControls(shortDescription)
                    : shortDescription}
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
                  {isAdmin ? (
                    this.renderBgSelect()
                  ) : (
                    <div className="group__feed-files-info">
                      {pluralizeFiles(files.length)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="group__add-info">
              <Participants projectGroupId={id} participants={participants} />

              {(isOpen || isAdmin) &&
                (participant
                  ? this.renderLeaveButton(id)
                  : this.renderJoinButton(id))}

              {!isOpen &&
                !isAdmin &&
                (participant
                  ? this.renderLeaveButton(id)
                  : this.renderRequestButton(id))}
            </div>
          </Col>
        </Row>
        {!isShortMode && files.length > 0 && (
          <Row type="flex">
            {description ? (
              <>
                <Col span={16}>{this.renderRestDescription(description)}</Col>
                <Col span={8}>{this.renderFiles()}</Col>
              </>
            ) : (
              <Col span={24}>{this.renderFiles()}</Col>
            )}
          </Row>
        )}
        <Row gutter={37}>
          <Col span={16}>
            <div style={{ marginBottom: "40px" }} />
            {!this.state.isConversationModalVisible && this.renderAddRegion()}
            {this.state.isConversationModalVisible && (
              <ConversationForm
                ref={this.formRef}
                avatar={this.props.userAvatar}
                userName={this.props.userName}
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                projectGroupId={id}
              />
            )}
            {!this.state.isConversationModalVisible &&
              this.renderConversations()}
          </Col>
          <Col span={8}>{this.renderPinnedConversations()}</Col>
        </Row>
      </>
    );
  }
}
const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    userAvatar: state.Login.avatar,
    userName: state.Login.userName,
    posts: state.ProjectGroup.posts,
    group: state.ProjectGroup.group,
    backgrounds: state.projectGroups.backgrounds
  };
};

export default connect(mapStateToProps)(GroupFeed);
