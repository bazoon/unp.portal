import React, { Component } from "react";
import cn from "classnames";
import moment from "moment";
import { Scrollbars } from 'react-custom-scrollbars';
import groupBy from "lodash/groupBy";
import { Drawer, Input, Button, Popover, Checkbox, Upload, Badge } from "antd";
import PropTypes from "prop-types";
import "intersection-observer";
import { observer, inject } from "mobx-react";
import Observer from "@researchgate/react-intersection-observer";
import "./Chat.less";
import ChatChannelsIcon from "../../../images/chatChannels";
import AddChatIcon from "../../../images/addChat";
import ChatUserIcon from "../../../images/chatUser";
import UploadWindow from "../UploadWindow/UploadWindow";
import FileIcon from "../../../images/folder";
import { pluralizeParticipants } from "../../utils/pluralize";
import MoreIcon from "../../../images/more";
import SendIcon from "../../../images/telesend";
import EmojiIcon from "../../../images/emoji";
import UsersWindow from "../UsersWindow/UsersWindow";
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import ChatLeaveIcon from "../../../images/chatLeave";
import AddAvatarIcon from "../../../images/addAvatar";
import AddUserIcon from "../../../images/addUser";
import UserIcon from "../../../images/user";
import MinusIcon from "../../../images/minus";

const chatStates = {
  chat: 0,
  create: 1,
  private: 2,
  search: 3,
  admin: 4
};

@inject("currentUserStore")
@inject("usersStore")
@inject("chatStore")
@observer
class Chat extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    chat: PropTypes.arrayOf(PropTypes.object),
    channels: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    chat: [],
    channels: []
  };

  constructor(props) {
    super(props);
    this.state = {
      chatState: chatStates.chat,
      isUploadVisible: false,
      files: [],
      selectedUserId: undefined,
      selectedGroupUsers: {},
      channelName: "",
      channelAvatar: "",
      isUsersWindowVisible: false,
      isRemoveUsersWindowVisible: false,
    };
    this.formRef = React.createRef();
    this.chatTalkRef = React.createRef();
    this.inputRef = React.createRef();
    this.listRef = React.createRef();
  }

  componentDidMount = () => {
    this.props.chatStore.getChannels();
    this.props.usersStore.loadAllUsers();
  };

  componentDidUpdate = () => {
    // this.scrollChatTalk();
    // this.inputRef.current && this.inputRef.current.focus();
  };

  handleSend = () => {
    const { userId } = this.props.currentUserStore;

    if (this.props.chatStore.currentMessage) {
      this.props.chatStore.sendChatMessage({
        channelId: this.props.chatStore.activeChannel.id,
        message: this.props.chatStore.currentMessage,
        type: "text",
        userId
      });
    }
  };

  scrollChatTalk = () => {
    const chatTalk = this.chatTalkRef.current;
    if (!chatTalk) return;
    chatTalk.scrollBy(0, chatTalk.scrollHeight);
  };

  handleShowUpload = () => {
    this.setState({
      isUploadVisible: true
    });
  };

  handleHideUpload = () => {
    this.setState({
      isUploadVisible: false
    });
  };

  handleUploadFiles = () => {
    const { userId } = this.props.currentUserStore;
    const formData = new FormData();
    formData.append("channelId", this.props.chatStore.activeChannel.id);
    formData.append("userId", userId);
    this.state.files.forEach(f => {
      formData.append("file", f.originFileObj);
    });

    this.props.chatStore.sendChatFiles(userId, formData);
    this.handleHideUpload();
    this.setState({
      files: []
    });
  };

  leaveChannel(channel) {
    this.props.chatStore.leaveChannel({ id: channel.id });
  }

  addUserToChat() {
    this.setState({
      isUsersWindowVisible: true
    });
  }

  hideUsersWindow = () => {
    this.setState({
      isUsersWindowVisible: false
    });
  };

  removeUsersFromChat() {
    this.setState({
      chatState: chatStates.admin
    });
  }

  hideRemoveUsersWindow = () => {
    this.setState({
      isRemoveUsersWindowVisible: false
    });
  };

  handleAddUsersToChannel = users => {
    const { activeChannel } = this.props.chatStore;
    return this.props.chatStore
      .addUsersToChannel({
        users
      })
      .then(() => {
        this.hideUsersWindow();
      });
  };

  handleRemoveUsersFromChannel = users => {
    const { activeChannel } = this.props.chatStore;
    return this.props.chatStore
      .removeUsersFromChannel({
        users
      });
  }

  handleUploadChannelAvatar = ({ file }) => {
    const formData = new FormData();
    const { id } = this.props.chatStore.activeChannel;
    formData.append("id", id);
    formData.append("file", file);
    this.props.chatStore.updateChannelAvatar({ id, payload: formData });
  }

  handleAddEmoji = ({ native }) => {
    this.props.chatStore.setCurrentMessage(this.props.chatStore.currentMessage + native);
  }

  // renders

  renderMessage = m => {
    switch (m.type) {
      case "text": {
        return this.renderTextMessage(m);
      }
      case "file": {
        return this.renderFileMessage(m);
      }
      default: {
        return this.renderTextMessage(m);
      }
    }
  };

  renderMessageTemplate = (m, content) => {
    const messageId = `${m.id}-${m.seen}`;
    const isOwnMessage = this.props.currentUserStore.userId == m.userId;

    return isOwnMessage ? (
      <div
        id={`message-${m.id}`}
        className="chat__message_own"
        key={m.id}
        data-id={messageId}
      >
        <div className="chat__message_own-author">{m.userName}</div>
        <div className="chat__message_own-avatar">
          {m.avatar && <img src={m.avatar} alt={m.userName} />}
        </div>

        <div className="chat__message_own-wrap">
          <div className="chat__message-date">
            {moment(m.createdAt).format("HH:mm")}
          </div>
          <div className="chat__message-text">{content}</div>
        </div>
      </div>
    ) : (
        <div
          id={`message-${m.id}`}
          className="chat__message"
          key={m.id}
          data-id={messageId}
        >
          <div className="chat__message-avatar">
            {m.avatar && <img src={m.avatar} alt={m.userName} />}
          </div>
          <div className="chat__message-author">{m.userName}</div>

          <div className="chat__message-wrap">
            <div className="chat__message-text">{content}</div>
            <div className="chat__message-date">
              {moment(m.createdAt).format("HH:mm")}
            </div>
          </div>
        </div>
      );
  };

  renderTextMessage = m => {
    return this.renderMessageTemplate(m, m.message);
  };

  renderFileMessage = m => {
    const isImage = fileName => {
      const extensions = ["jpg", "jpeg", "svg", "JPG"];
      return extensions.reduce((acc, e) => {
        return acc || (fileName && fileName.indexOf(e) > 0);
      }, false);
    };

    const content = (m.files
      && m.files.map(f => {
        return (
          <div key={f.id}>
            <a download href={f.url} style={{ display: "block" }}>
              {f.name}
            </a>
            {isImage(f.name) && (
              <img className="chat__message-image" src={f.url} alt="some" />
            )}
          </div>
        );
      }))
      || "";
    return this.renderMessageTemplate(m, content);
  };

  renderOperationsMenu(channel) {
    const { isAdmin } = this.props.currentUserStore;
    const { activeChannel } = this.props.chatStore;

    return (
      <div className="operations-menu" style={{ width: "250px" }}>
        {/* <div onClick={() => this.props.onEdit()}>Удаление диалога</div> */}
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => this.leaveChannel(channel)}>
          <ChatLeaveIcon width="17px" />
          Выйти из чата
        </div>
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => this.addUserToChat(channel)}>
          <AddUserIcon width="19px" />
          Добавить пользователя
        </div>
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => this.removeUsersFromChat()}>
          <UserIcon width={20} />
          Участники
        </div>
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => { }}>
          <AddAvatarIcon />
          <Upload
            onChange={this.handleUploadChannelAvatar}
            beforeUpload={() => false}
            multiple
            showUploadList={false}
          >
            <div className="operations-menu__item">
              Загрузить аватар
            </div>
          </Upload>
        </div>


      </div>
    );
  }

  renderChannelHeader() {
    const { activeChannel } = this.props.chatStore;
    const participants = activeChannel && activeChannel.participants;
    const participantsCount = participants && participants.length;
    const avatar = activeChannel && activeChannel.avatar;

    return (
      <div className="chat__channel__top">
        {activeChannel && (
          <div className="chat__channel__top-wrap">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="chat__channel__top-avatar">
                {this.renderChannelAvatar(avatar)}
              </div>
              <div className="chat__channel-name">
                {this.props.chatStore.getActiveChannelName()}
                <div className="chat__channel-count">
                  {pluralizeParticipants(participantsCount)}
                </div>
              </div>
            </div>
            <div className="chat__channel-menu">
              <Popover
                placement="bottomRight"
                content={this.renderOperationsMenu(activeChannel)}
                trigger="click"
              >
                <div className="operations-menu__icon">
                  <MoreIcon />
                </div>
              </Popover>
            </div>
          </div>
        )}
      </div>
    );
  }

  renderMessages() {
    const { activeChannel } = this.props.chatStore;

    const options = {
      onChange: this.handleMessageIntersection,
      root: ".chat__talk"
    };
    const messages = activeChannel && activeChannel.messages;
    const groupedMessages = groupBy(messages, m => {
      return moment(m.createdAt).format("DD MMMM YYYY");
    });

    const days = Object.keys(groupedMessages);

    return (
      <div className="chat__messages-box">
        {this.renderChannelHeader()}
        <div
          className="chat__messages"
          onScroll={this.handleChatScroll}
          ref={this.chatTalkRef}
        >
          <Scrollbars
            autoHide
            universal
          >
            {days.map(day => {
              const messages = groupedMessages[day];

              return (
                <React.Fragment key={day}>
                  <div className="chat__messages-day">{day}</div>
                  {messages.map(m => (
                    <React.Fragment key={m.id}>
                      <Observer {...options}>{this.renderMessage(m)}</Observer>
                    </React.Fragment>
                  ))}
                </React.Fragment>
              );
            })}
          </Scrollbars>

        </div>
        {activeChannel && (
          <div className="chat__controls-wrap">
            <div className="chat__controls">
              <div className="chat__controls-file-icon">
                <FileIcon onClick={this.handleShowUpload} />
              </div>
              <Input
                ref={this.inputRef}
                disabled={!activeChannel}
                autoFocus
                placeholder="Введите сообщение"
                value={this.props.chatStore.currentMessage}
                onChange={this.handleMessageChange}
                onKeyPress={this.handleInputKeyPress}
              />
              <Popover
                placement="bottomRight"
                content={<Picker onClick={this.handleAddEmoji} />}
                trigger="click"
              >
                <EmojiIcon style={{ marginRight: '16px', cursor: 'pointer' }} />

              </Popover>
              <SendIcon style={{ marginRight: '10px', cursor: 'pointer' }} onClick={this.handleSend} />
            </div>
          </div>
        )}

      </div>
    );
  }

  handleMessageChange = e => {
    this.props.chatStore.setCurrentMessage(e.target.value);
  };

  handleInputKeyPress = e => {
    if (e.charCode === 13) {
      this.handleSend();
    }
  };

  handleFileUpload = () => {
    const form = this.formRef.current;
    const input = form.querySelector("input[type=file]");
    input.click();
  };

  handleFileChange = files => {
    this.setState({
      files
    });
  };

  handleChangeChanel = (channelId, messageId) => {
    this.props.chatStore.setActiveChannel(channelId);
    this.setState({
      chatState: chatStates.chat
    });
  };

  handleOpenChannelAtMessage = (channelId, messageId) => {
    this.props.chatStore.openChannelAtMessage(channelId, messageId).then(() => {
      const messageElement = document.querySelector(`#message-${messageId}`);
      messageElement && messageElement.scrollIntoView();
    });
  };

  handleMessageIntersection = e => {
    const { target } = e;
    const { dataset } = target;
    const { userId } = this.props.currentUserStore;

    const [messageId, seen] = dataset.id.split("-");

    if (e.isIntersecting && seen !== "true") {
      this.props.chatStore.markAsRead({
        messageId
      });

      target.setAttribute("data-id", `${messageId}-true`);
    }
  };

  loadMoreTop() {
    if (
      this.props.chatStore.activeChannel
      && this.props.chatStore.activeChannel.hasMoreMessagesTop
    ) {
      this.props.chatStore.activeChannel.loadMoreMessagesTop();
      return true;
    }
    return false;
  }

  loadMoreBottom() {
    if (
      this.props.chatStore.activeChannel
      && this.props.chatStore.activeChannel.hasMoreMessagesBottom
    ) {
      this.props.chatStore.activeChannel.loadMoreMessagesBottom();
      return true;
    }
    return false;
  }

  handleLoadMore = () => this.loadMore();

  handleListScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    const list = this.listRef.current;

    if (scrollTop <= 100) {
      this.loadMore();
      // setTimeout(() => {
      //   // debugger;

      //   // const currentTop = list.Grid.getTotalRowsHeight();
      //   // const diff = currentTop - scrollTop;
      //   // list.scrollToPosition();
      //   list.scrollToRow(2);
      // }, 100);
    }
  };

  handleChatScroll = e => {
    const { target } = e;
    const { scrollTop, scrollHeight, offsetHeight } = target;

    if (scrollTop === 0) {
      if (this.loadMoreTop() !== false) {
        setTimeout(() => {
          target.scrollTop = 100;
        });
      }
    } else if (offsetHeight + scrollTop == scrollHeight) {
      this.loadMoreBottom();
    }
  };

  handleScrollDown = () => {
    const chatTalks = this.chatTalkRef.current;
    chatTalks.scrollTop = chatTalks.scrollHeight;
  };

  handleAddChannel = () => {
    this.setState({
      isNewChannelWindowOpen: true
    });
  };

  handleNewChannelCancel = () => {
    this.setState({
      isNewChannelWindowOpen: false
    });
  };

  handleNewChannelOk = fields => {
    this.setState({
      isNewChannelWindowOpen: false
    });
  };

  handleAddNewUser = () => {
    this.setState({
      isNewUserWindowOpen: true
    });
  };

  handleNewUserCancel = () => {
    this.setState({
      isNewUserWindowOpen: false
    });
  };

  handleNewUserOk = fields => {
    this.setState({
      isNewUserWindowOpen: false
    });
  };

  handleJoinChannel = () => {
    this.setState({
      isJoinWindowOpen: true
    });
  };

  handleJoinChannelCancel = () => {
    this.setState({
      isJoinWindowOpen: false
    });
  };

  handleJoinChannelOk = fields => {
    this.setState({
      isJoinWindowOpen: false
    });
  };

  renderChannelAvatar(avatar) {
    if (!avatar) return <div className="placeholder" />;
    return avatar.includes("http") ? (
      <img src={avatar} alt="logo" />
    ) : (
        <img src={avatar} alt="logo" />
      );
  }

  handleViewMessages = () => {
    this.setState({
      chatState: chatStates.chat
    });
  };

  handleCreateGroup = () => {
    this.setState({
      chatState: chatStates.create
    });
  };

  handleCreatePrivateChat = () => {
    this.props.chatStore
      .createPrivateChat(this.state.selectedUserId)
      .then(() => {
        this.handleViewMessages();
      });
  };

  handleToggleUsers = () => {
    this.setState({
      chatState: chatStates.private
    });
  };

  handleSelectUser = id => {
    this.setState({
      selectedUserId: id
    });
  };

  handleSelectGroupUser = id => {
    const checked = this.state.selectedGroupUsers[id];
    this.setState({
      selectedGroupUsers: { ...this.state.selectedGroupUsers, [id]: !checked }
    });
  };

  handleChangeChannelName = e => {
    this.setState({
      channelName: e.target.value
    });
  };

  handleCreateChannel = () => {
    const { selectedGroupUsers, channelName, channelAvatar } = this.state;

    if (!channelName) {
      notification.warn({
        message: "Укажите имя канала"
      });
      return;
    }

    const usersIds = Object.keys(selectedGroupUsers).reduce((acc, key) => {
      return selectedGroupUsers[key] ? acc.concat([key]) : acc;
    }, []);

    const file = channelAvatar && channelAvatar[0] && channelAvatar[0].originFileObj;

    const formData = new FormData();
    formData.append("usersIds", JSON.stringify(usersIds));
    formData.append("channelName", channelName);
    formData.append("channelAvatar", file);

    this.props.chatStore.createChannel(formData).then(() => {
      this.setState({
        channelName: "",
        channelAvatar: "",
        selectedGroupUsers: {}
      });
      this.handleViewMessages();
    });
  };

  handleChannelAvatarChanged = value => {
    this.setState({
      channelAvatar: value.fileList
    });
  };

  handleSearch = ({ target }) => {
    const { value } = target;

    this.props.chatStore.searchChannels(value);
    this.props.chatStore.searchMessages(value);

    if (value) {
      this.setState({
        chatState: chatStates.search
      });
    } else {
      this.setState({
        chatState: chatStates.chat
      });
    }
  };

  handleRemoveUserFromChannel = () => {

  }

  // renders

  renderChatChanels() {
    const { channels } = this.props.chatStore;
    return channels.map(channel => this.renderChannel(channel));
  }

  renderFoundChanels() {
    const { foundChannels } = this.props.chatStore;
    return foundChannels.map(channel => this.renderChannel(channel));
  }

  renderFoundMessages = () => {
    const { foundMessages } = this.props.chatStore;
    return foundMessages.map(m => this.renderFoundMessage(m));
  };

  renderFoundMessage(m) {
    const { id, avatar, createdAt, channelId, message, userName } = m;
    const date = createdAt && moment(createdAt).format("HH:mm");
    return (
      <div
        key={id}
        className="chat__channels-item"
        onClick={() => this.handleOpenChannelAtMessage(channelId, id)}
      >
        <div className="chat__channels-avatar">
          {this.renderChannelAvatar(avatar)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="chat__channels-wrap">
            <div className="chat__channels-title">{userName}</div>
            <div className="chat__channels-date">{date}</div>
          </div>
          <div className="chat__channels-wrap">
            <div className="chat__channels-last">{message}</div>
          </div>
        </div>
      </div>
    );
  }

  renderChannel(channel) {
    const { activeChannel } = this.props.chatStore;
    const className = cn("chat__channels-item", {
      "chat__channels-item_active":
        (activeChannel && activeChannel.id) == channel.id
    });

    const { name } = channel;
    const { userName, message, createdAt } = channel.lastMessage || {};
    const date = createdAt && moment(createdAt).format("HH:mm");
    const { unreads } = channel;

    return (
      <div
        key={channel.id}
        className={className}
        onClick={() => this.handleChangeChanel(channel.id)}
      >
        <div className="chat__channels-avatar">
          {this.renderChannelAvatar(channel.avatar)}
        </div>
        <div style={{ flex: 1 }}>
          <div className="chat__channels-wrap">
            <div className="chat__channels-title">{name}</div>
            <div className="chat__channels-date">{date}</div>
          </div>
          <div className="chat__channels-user-name">{userName}</div>
          <div className="chat__channels-wrap">
            <div className="chat__channels-last">{message}</div>
            {unreads > 0 && (
              <Badge
                count={unreads}
                style={{
                  backgroundColor: "#1790ff",
                  color: "#fff"
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  renderUsers() {
    const { users } = this.props.usersStore;
    const { selectedUserId } = this.state;

    return users.map(user => {
      const className = cn("chat__users-item", {
        "chat__users-item_active": selectedUserId === user.id
      });

      return (
        <div
          key={user.id}
          className={className}
          onClick={() => this.handleSelectUser(user.id)}
          onDoubleClick={this.handleCreatePrivateChat}
        >
          <div className="chat__users-avatar">
            <img src={user.avatar} />
          </div>

          <div className="chat__users-name">{user.name}</div>
        </div>
      );
    });
  }

  renderGroupCreation = () => {
    return (
      <div className="chat__group-creation">
        <div className="chat__group-creation-header">
          <div>
            <div className="chat__group-creation-title">Групповой чат</div>
            <div className="chat__group-creation-title chat__group-creation-title_sub">
              Добавление пользователей
            </div>
          </div>
          <Button type="primary" onClick={this.handleCreateChannel}>
            Создать
          </Button>
        </div>
        <div className="chat__group-creation-input">
          <Upload
            onChange={this.handleChannelAvatarChanged}
            fileList={this.state.channelAvatar}
            beforeUpload={() => false}
          >
            <FileIcon />
          </Upload>
        </div>
        <div className="chat__group-creation-input">
          <Input
            value={this.state.channelName}
            placeholder="Введите название канала"
            onChange={this.handleChangeChannelName}
            required
          />
        </div>
        <div className="chat__group-creation-users">
          <Scrollbars
            autoHide
            universal
          >
            {this.props.usersStore.users.map(user => {
              const checked = this.state.selectedGroupUsers[user.id];
              return (
                <div key={user.id} className="chat__group-creation-user">
                  <div className="chat__group-creation-user-wrap">
                    <img
                      className="chat__group-creation-user-avatar"
                      src={user.avatar}
                    />
                    <div className="chat__group-creation-user-name">
                      {user.name}
                    </div>
                  </div>
                  <Checkbox
                    checked={checked}
                    onClick={() => this.handleSelectGroupUser(user.id)}
                  />
                </div>
              );
            })}
          </Scrollbars>
        </div>
      </div>
    );
  };

  renderAdminPanel = () => {
    const activeChannel = this.props.chatStore.activeChannel || {};
    const channelParticipants = activeChannel.participants || [];

    return (
      <div className="chat__admin-panel">
        {this.renderChannelHeader()}
        <div className="chat__admin-panel-participants">
          {
            channelParticipants.map(p => {
              return (
                <div key={p.id} className="chat__admin-panel-participant">
                  <MinusIcon style={{ marginRight: '16px', cursor: 'pointer' }} onClick={() => this.handleRemoveUsersFromChannel([p.id])} />
                  <img className="avatar avatar_medium" src={p.avatar} />
                  <div>
                    {p.name}
                  </div>
                </div>
              );
            })
          }
        </div>

      </div>
    );
  }

  renderFooter(chatState) {
    return (
      <div className="chat__footer-controls">
        <ChatChannelsIcon
          isActive={chatState === chatStates.chat}
          onClick={this.handleViewMessages}
        />
        <AddChatIcon
          isActive={chatState === chatStates.create}
          onClick={this.handleCreateGroup}
        />
        <ChatUserIcon
          isActive={chatState === chatStates.private}
          onClick={this.handleToggleUsers}
        />
      </div>
    );
  }

  renderSearchResults() {
    return (
      <>
        <div>{this.renderFoundChanels()}</div>
        <div>{this.renderFoundMessages()}</div>
      </>
    );
  }

  render() {
    const { visible, isLoading, socketError } = this.props;
    const { chatState } = this.state;
    const activeChannel = this.props.chatStore.activeChannel || {};

    // const chatIndicatorCls = cn("chat__indicator", {
    //   chat__indicator_connected: isSocketConnected
    // });

    return (
      <>
        <Drawer
          className="chat"
          placement="right"
          visible={visible}
          onClose={this.props.onClose}
          width={720}
          closable={false}
        >
          <div className="chat__container">
            <div className="chat__left-panel">
              <div className="chat__search">
                <Input.Search
                  placeholder="Поиск по чату"
                  style={{ width: "100%" }}
                  onChange={this.handleSearch}
                />
              </div>

              {(chatState === chatStates.chat || chatState === chatStates.admin) && (
                <div className="chat__channels">

                  <Scrollbars
                    autoHide
                    universal
                  >
                    {this.renderChatChanels()}
                  </Scrollbars>
                </div>
              )}

              {chatState === chatStates.create && (
                <div className="chat__channels" />
              )}

              {chatState === chatStates.private && (
                <Scrollbars
                  autoHide
                  universal
                >
                  <div className="chat__users">
                    {this.renderUsers()}
                  </div>
                </Scrollbars>
              )}

              {chatState === chatStates.search && (
                <div className="chat__users">
                  <Scrollbars
                    autoHide
                    universal
                  >
                    {this.renderSearchResults()}
                  </Scrollbars>
                </div>
              )}

              {this.renderFooter(chatState)}
            </div>
            <div className="chat__right-panel">
              <div className="chat__talk">
                {(chatState === chatStates.chat
                  || chatState === chatStates.search)
                  && this.renderMessages()}
                {chatState === chatStates.private && <div />}
                {chatState === chatStates.create && this.renderGroupCreation()}
                {chatState === chatStates.admin && this.renderAdminPanel()}
              </div>
            </div>
          </div>
        </Drawer>

        <UploadWindow
          visible={this.state.isUploadVisible}
          onCancel={this.handleHideUpload}
          onChange={this.handleFileChange}
          onOk={this.handleUploadFiles}
          value={this.state.files}
        />
        {
          this.state.isUsersWindowVisible && (
            <UsersWindow
              onCancel={this.hideUsersWindow}
              visible={this.state.isUsersWindowVisible}
              onOk={this.handleAddUsersToChannel}
            />
          )
        }


      </>
    );
  }
}

export default Chat;
