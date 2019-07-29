import React, { Component } from "react";
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

import { Link } from "react-router-dom";
import moment from "moment";
import RightIcon from "../../../images/arrow_right";
import UpIcon from "../../../images/arrow_up";
import Participants from "./Participants";
import { pluralizeFiles } from "../../utils/pluralize";
import cn from "classnames";
import SelectBgIcon from "../../../images/selectBg";
import BackgroundSlider from "./BackgroundSlider";
import EditIcon from "../../../images/edit";
import DoneEditIcon from "../../../images/done-edit";
import ConversationForm from "./Conversation/ConversationForm";
import Files from "../Files/Files";
import ChatIcon from "../../../images/chat";
import { observer, inject } from "mobx-react";
import GroupButton from "../ProjectGroups/GroupButton";
import Conversation from "./Conversation/Conversation";
import UploadWindow from "../UploadWindow/UploadWindow";
import "./Group.less";

const maxDescriptionSentences = 10;

@inject("groupsStore")
@inject("currentUserStore")
@observer
class GroupFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConversationModalVisible: false,
      isShortMode: true,
      isTitleOver: false,
      isTitleEditing: false,
      isShortDescriptionEditing: false,
      isUploadVisible: false,
      files: []
    };
    this.editingFields = {};
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.groupsStore.getCurrent(id);
    this.props.groupsStore.getBackgrounds();
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

  handleToggleMore = () => {
    this.setState({
      isShortMode: !this.state.isShortMode
    });
  };

  handleSubscribe = () => {
    const { id } = this.props.match.params;
    this.props.groupsStore.subscribe(id);
  };

  handleRequest = () => {
    const { id } = this.props.match.params;
    this.props.groupsStore.request(id);
  };

  handleUnsubscribe = () => {
    const { id } = this.props.match.params;
    this.props.groupsStore.unsubscribe(id);
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

  handleChangeField = (field, e) => {
    this.editingFields[field] = e.target.value;
  };

  handleSelectBackground = backgroundId => {
    const { id } = this.props.match.params;
    this.props.groupsStore.updateBackground({ groupId: id, backgroundId });
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
    const { id } = this.props.match.params;
    if (this.editingFields.title) {
      this.props.groupsStore.updateGroupTitle({
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
    if (!e.target.closest(".group__feed-description")) {
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
    const { id } = this.props.match.params;
    if (this.editingFields.shortDescription) {
      this.props.groupsStore.updateGroupShortDescription({
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

  handleHideUpload = () => {
    this.setState({
      isUploadVisible: false
    });
  };

  handleUploadFiles = () => {
    const { id } = this.props.match.params;
    const formData = new FormData();
    formData.append("groupId", id);

    this.state.files.forEach(f => {
      formData.append("file", f.originFileObj);
    });

    this.props.groupsStore.uploadFiles(formData);
    this.handleHideUpload();
  };

  handleFileChange = files => {
    this.setState({
      files
    });
  };

  handleShowUpload = () => {
    this.setState({
      isUploadVisible: true
    });
  };

  handleDeleteFile = fileId => {
    this.props.groupsStore.deleteFile(fileId);
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

  renderConversations(conversations = [], isAdmin = false) {
    const { id } = this.props.match.params;

    if (!conversations || conversations.length === 0) {
      return (
        <div className="group__conversations">
          <div className="empty-text">Записей пока нет</div>
        </div>
      );
    }

    return (
      <div className="group__conversations">
        {conversations.map(conversation => {
          return (
            <Conversation
              key={conversation.id}
              id={conversation.id}
              showMenu
              name={conversation.name}
              createdAt={conversation.createdAt}
              groupId={id}
              isPinned={conversation.isPinned}
              title={conversation.title}
              description={conversation.description}
              count={conversation.count}
              isCommentable={conversation.isCommentable}
              canDelete={conversation.canDelete}
              isAdmin={isAdmin}
            />
          );
        })}
      </div>
    );
  }

  renderRestDescription(description) {
    return <div className="group__feed-rest-description">{description}</div>;
  }

  renderFiles(files) {
    return (
      <div className="files group__files">
        <div className="files-title">Прикрепленные файлы</div>
        <Files files={files} onDelete={this.handleDeleteFile} />
        <Button onClick={this.handleShowUpload} icon="upload">
          Добавить файл
        </Button>
        <UploadWindow
          visible={this.state.isUploadVisible}
          onCancel={this.handleHideUpload}
          onChange={this.handleFileChange}
          onOk={this.handleUploadFiles}
          value={this.state.files}
        />
      </div>
    );
  }

  renderPinnedConversations = group => {
    if (!group) return null;
    const { id } = group;
    const { pinned } = group;

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
              backgrounds={this.props.groupsStore.backgrounds}
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
              <SelectBgIcon className="bg-select-icon" />
            </div>
          </div>
        </Popover>
      </>
    );
  }

  render() {
    const currentGroup = this.props.groupsStore.current || {};
    const {
      id,
      title,
      avatar,
      description,
      shortDescription,
      participant,
      participants = [],
      isOpen,
      isAdmin,
      canPost,
      state
    } = currentGroup;

    const files = (currentGroup.files && currentGroup.files.slice()) || [];

    const { isShortMode } = this.state;

    const conversations =
      this.props.groupsStore.current &&
      this.props.groupsStore.current.conversations;

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
              {canPost && (
                <Participants projectGroupId={id} participants={participants} />
              )}
              <GroupButton
                isOpen={isOpen}
                isAdmin={isAdmin}
                state={state}
                participant={participant}
                onJoin={this.handleSubscribe}
                onLeave={this.handleUnsubscribe}
                onRequest={this.handleRequest}
              />
            </div>
          </Col>
        </Row>
        {!isShortMode && (
          <Row type="flex">
            {description ? (
              <>
                <Col span={16}>{this.renderRestDescription(description)}</Col>
                {<Col span={8}>{canPost && this.renderFiles(files)}</Col>}
              </>
            ) : (
              <Col span={24}>{canPost && this.renderFiles(files)}</Col>
            )}
          </Row>
        )}
        <Row gutter={37}>
          <Col span={16}>
            <div style={{ marginBottom: "40px" }} />
            {canPost &&
              !this.state.isConversationModalVisible &&
              this.renderAddRegion()}
            {this.state.isConversationModalVisible && (
              <ConversationForm
                ref={this.formRef}
                avatar={this.props.currentUserStore.avatar}
                userName={this.props.currentUserStore.userName}
                onCancel={this.handleCancel}
                onOk={this.handleOk}
                projectGroupId={id}
              />
            )}
            {canPost &&
              !this.state.isConversationModalVisible &&
              this.renderConversations(conversations, isAdmin)}
          </Col>
          <Col span={8}>
            {canPost &&
              this.renderPinnedConversations(this.props.groupsStore.current)}
          </Col>
        </Row>
      </>
    );
  }
}

export default GroupFeed;
