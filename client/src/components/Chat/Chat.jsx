import React, { Component } from "react";
import cn from "classnames";
import moment from "moment";
import {
  Drawer,
  Input,
  Button,
  Icon,
  Spin,
  Popover,
  Tooltip,
  Checkbox
} from "antd";
import PropTypes from "prop-types";
import "intersection-observer";
import { observer, inject } from "mobx-react";
import Observer from "@researchgate/react-intersection-observer";
import NewChannel from "./NewChannel";
import NewUser from "./NewUser";
import JoinChannel from "./JoinChannel";
import "./Chat.less";
import ChatChannelsIcon from "../../../images/chatChannels";
import AddChatIcon from "../../../images/addChat";
import ChatUserIcon from "../../../images/chatUser";
import UploadWindow from "../UploadWindow/UploadWindow";

import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from "react-virtualized";

import chatSocket from "./socket";

function hashCode(string) {
  if (!string) return "333";
  var hash = 0;
  if (string.length === 0) {
    return hash;
  }
  for (var i = 0; i < string.length; i++) {
    var char = string.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

const colors = [
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16),
  Math.floor(Math.random() * 16777215).toString(16)
];

const rightPanelStates = {
  chat: 0,
  createGroup: 1
};

const leftPanelStates = {
  channels: 0,
  users: 1
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
    channels: [],
    activePages: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      currentMessage: "",
      isSocketConnected: false,
      isNewChannelWindowOpen: false,
      isNewUserWindowOpen: false,
      isJoinWindowOpen: false,
      rightPanelState: rightPanelStates.chat,
      leftPanelState: leftPanelStates.channels,
      isUploadVisible: false,
      files: [],
      selectedUserId: undefined
    };
    this.formRef = React.createRef();
    this.chatTalkRef = React.createRef();
    this.inputRef = React.createRef();
    this.listRef = React.createRef();
  }

  componentDidMount = () => {
    const userId = this.props.currentUserStore.userId;
    this.props.chatStore.getChannels();
    this.props.usersStore.loadAllUsers();
  };

  componentDidUpdate = (prevProps, prevState) => {
    // this.scrollChatTalk();
    // this.inputRef.current && this.inputRef.current.focus();
  };

  handleSend = () => {
    const userId = this.props.currentUserStore.userId;

    this.props.chatStore.sendChatMessage({
      channelId: this.props.chatStore.activeChannel.id,
      message: this.props.chatStore.currentMessage,
      type: "text",
      userId
    });
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
    const userId = this.props.currentUserStore.userId;
    const formData = new FormData();
    formData.append("channelId", this.props.chatStore.activeChannel.id);
    formData.append("userId", userId);
    this.state.files.forEach(f => {
      formData.append("file", f.originFileObj);
    });

    this.props.chatStore.sendChatFiles(userId, formData);
    this.handleHideUpload();
  };

  //renders

  renderMessage = m => {
    switch (m.type) {
      case "text": {
        return this.renderTextMessage(m);
        break;
      }
      case "file": {
        return this.renderFileMessage(m);
        break;
      }
      default: {
        return this.renderTextMessage(m);
      }
    }
  };

  renderMessageTemplate = (m, content) => {
    const { activeChannelId } = this.props;
    const messageId = `${activeChannelId}-${m.id}-${m.seen}`;
    const hash = Math.abs(hashCode(m.userName));
    const index = hash % 10;
    const colorStyle = {
      color: `#${colors[index]}`
    };

    return (
      <div className="chat__message" key={m.id} data-id={messageId}>
        <div className="chat__message-avatar">
          {m.avatar && <img src={m.avatar} alt={m.userName} />}
        </div>
        <div style={colorStyle} className="chat__message-author">
          {m.userName}
        </div>
        {content}
        <div className="chat__message-info">
          <div className="chat__message-date">
            {moment(m.createdAt).format("HH:mm")}
          </div>
          <div className="chat__message-seen">{m.seen ? "✔" : null}</div>
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

    const content =
      (m.files &&
        m.files.map(f => {
          return (
            <div key={f.id}>
              <a download href={f.file} style={{ display: "block" }}>
                {f.file}
              </a>
              {isImage(f.name) && (
                <img className="chat__message-image" src={f.url} alt="some" />
              )}
            </div>
          );
        })) ||
      "";

    return this.renderMessageTemplate(m, content);
  };

  renderMessages() {
    const { activeChannel } = this.props.chatStore;
    const { currentMessage } = this.props.chatStore;
    const options = {
      onChange: this.handleMessageIntersection,
      root: ".chat__talk"
    };

    return (
      <div className="chat__messages-box">
        <div className="chat__channel-name">
          {this.props.chatStore.getActiveChannelName()}
        </div>
        <div
          className="chat__messages"
          onScroll={this.handleChatScroll}
          ref={this.chatTalkRef}
        >
          {activeChannel &&
            activeChannel.messages &&
            activeChannel.messages.map(m => (
              <React.Fragment key={m.id}>
                <Observer {...options}>{this.renderMessage(m)}</Observer>
              </React.Fragment>
            ))}
          <div className="chat__talk-down">
            <Button
              size="large"
              icon="down-circle"
              onClick={this.handleScrollDown}
            />
          </div>
        </div>
        <div className="chat__controls">
          <div className="chat__controls-file-icon">
            <Icon
              type="paper-clip"
              onClick={this.handleShowUpload}
              style={{ fontSize: "16px", color: "#00ccff" }}
            />
          </div>
          <Input
            ref={this.inputRef}
            disabled={!activeChannel}
            autoFocus
            value={this.props.chatStore.currentMessage}
            onChange={this.handleMessageChange}
            onKeyPress={this.handleInputKeyPress}
          />
        </div>
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

  handleChangeChanel = channelId => {
    this.props.chatStore.setActiveChannel(channelId);
  };

  handleMessageIntersection = e => {
    const { target } = e;
    const { dataset } = target;
    const userId = this.props.currentUserStore.userId;

    const [channelId, messageId, seen] = dataset.id.split("-");

    if (e.isIntersecting && seen !== "true") {
      // Actions.chatMarkAsRead({
      //   messageId,
      //   userId
      // });
      requestAnimationFrame(() => {
        target.querySelector(".chat__message-seen").textContent = "✔";
      });
    }
  };

  loadMore() {
    if (this.props.chatStore.activeChannel.hasMoreMessages) {
      this.props.chatStore.activeChannel.loadMoreMessages();
      return true;
    } else {
      return false;
    }
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
    const { scrollTop } = target;
    if (scrollTop === 0) {
      if (this.loadMore() !== false) {
        setTimeout(() => {
          target.scrollTop = 100;
        });
      }
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
    // return Actions.postCreateChannel(fields);
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
    // return Actions.postCreatePrivateChannel(fields);
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
    // return Actions.postJoinChannel(fields);
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
      rightPanelState: rightPanelStates.chat,
      leftPanelState: leftPanelStates.channels
    });
  };

  handleCreateGroup = () => {
    this.setState({
      rightPanelState: rightPanelStates.createGroup
    });
  };

  handleCreatePrivateChat = () => {
    this.props.chatStore
      .createPrivateChat(
        this.props.currentUserStore.id,
        this.state.selectedUserId
      )
      .then(() => {
        this.setState({
          leftPanelState: leftPanelStates.channels
        });
      });
  };

  handleToggleUsers = () => {
    this.setState({
      leftPanelState: leftPanelStates.users
    });
  };

  handleSelectUser = id => {
    this.setState({
      selectedUserId: id
    });
  };

  // renders

  renderChatChanels() {
    const { activeChannel } = this.props.chatStore;
    const { channels } = this.props.chatStore;
    const content = (
      <div>
        <Button onClick={this.handleCreatePrivateChat}>Чат</Button>
      </div>
    );

    return channels.map(channel => {
      const className = cn("chat__channels-item", {
        "chat__channels-item_active":
          (activeChannel && activeChannel.id) == channel.id
      });

      return (
        <div
          key={channel.id}
          className={className}
          onClick={() => this.handleChangeChanel(channel.id)}
        >
          <div className="chat__channels-avatar">
            <Popover content={content} trigger="contextMenu">
              {this.renderChannelAvatar(channel.avatar)}
            </Popover>
          </div>
          <div>
            <div className="chat__channels-title">{channel.name}</div>
            <div className="chat__channels-last">{channel.lastMessage}</div>
          </div>
        </div>
      );
    });
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
          <Button type="primary">Создать</Button>
        </div>
        <div className="chat__group-creation-users">
          {this.props.usersStore.users.map(user => {
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
                <Checkbox />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  render() {
    const { visible, isLoading, socketError } = this.props;
    const isSocketConnected = chatSocket.connected;
    const { rightPanelState, leftPanelState } = this.state;

    const chatIndicatorCls = cn("chat__indicator", {
      chat__indicator_connected: isSocketConnected
    });

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
                />
              </div>

              {leftPanelState === leftPanelStates.channels ? (
                <div className="chat__channels">{this.renderChatChanels()}</div>
              ) : (
                <div className="chat__users">{this.renderUsers()}</div>
              )}

              <div className="chat__footer-controls">
                <ChatChannelsIcon
                  isActive={rightPanelState === rightPanelStates.chat}
                  onClick={this.handleViewMessages}
                />
                <AddChatIcon
                  isActive={rightPanelState === rightPanelStates.createGroup}
                  onClick={this.handleCreateGroup}
                />
                <ChatUserIcon
                  isActive={leftPanelState === leftPanelStates.users}
                  onClick={this.handleToggleUsers}
                />
              </div>
            </div>
            <div className="chat__right-panel">
              <div className="chat__talk">
                <div className="chat__talk-spin">{isLoading && <Spin />}</div>

                {/* <div className="chat__search-controls">
                <Tooltip placement="bottom" title="Создать канал">
                  <Button icon="plus" onClick={this.handleAddChannel} />
                </Tooltip>
                <Tooltip placement="bottom" title="Присоединится к каналу">
                  <Button icon="link" onClick={this.handleJoinChannel} />
                </Tooltip>
                <Tooltip placement="bottom" title="Создать приватный чат">
                  <Button icon="user-add" onClick={this.handleAddNewUser} />
                </Tooltip>

                <Button icon="more" onClick={this.handleLoadMore} />
              </div> */}
                {rightPanelState === rightPanelStates.chat
                  ? this.renderMessages()
                  : this.renderGroupCreation()}
              </div>
            </div>
          </div>
          <NewChannel
            isOpen={this.state.isNewChannelWindowOpen}
            onOk={this.handleNewChannelOk}
            onCancel={this.handleNewChannelCancel}
          />
          <NewUser
            isOpen={this.state.isNewUserWindowOpen}
            onOk={this.handleNewUserOk}
            onCancel={this.handleNewUserCancel}
          />
          <JoinChannel
            isOpen={this.state.isJoinWindowOpen}
            onOk={this.handleJoinChannelOk}
            onCancel={this.handleJoinChannelCancel}
          />
        </Drawer>
        <UploadWindow
          visible={this.state.isUploadVisible}
          onCancel={this.handleHideUpload}
          onChange={this.handleFileChange}
          onOk={this.handleUploadFiles}
          value={this.state.files}
        />
      </>
    );
  }
}

export default Chat;
