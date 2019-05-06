import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import cn from "classnames";
import moment from "moment";
import { Drawer, Input, Button, Icon, Spin, Popover, Tooltip } from "antd";
import PropTypes from "prop-types";
import "intersection-observer";
import Observer from "@researchgate/react-intersection-observer";
import NewChannel from "./NewChannel";
import NewUser from "./NewUser";
import JoinChannel from "./JoinChannel";

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
      isJoinWindowOpen: false
    };
    this.formRef = React.createRef();
    this.chatTalkRef = React.createRef();
    this.inputRef = React.createRef();
    this.listRef = React.createRef();
  }

  componentDidMount = () => {
    Actions.getChannels(this.props.userId);
    Actions.getAllChannels();

    chatSocket.on("connect", () => {
      this.setState({
        isSocketConnected: true
      });
    });

    chatSocket.on("disconnect", () => {
      this.setState({
        isSocketConnected: false
      });
    });

    chatSocket.on("channel-message", message => {
      Actions.addNewMessage({ message });
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    // this.scrollChatTalk();
    this.inputRef.current && this.inputRef.current.focus();
  };

  handleSend = () => {
    Actions.sendChatMessage({
      channelId: this.props.activeChannelId,
      message: this.state.currentMessage,
      type: "text",
      userId: this.props.userId
    }).then(() => {
      this.setState({
        currentMessage: ""
      });
    });
  };

  scrollChatTalk = () => {
    const chatTalk = this.chatTalkRef.current;
    if (!chatTalk) return;
    chatTalk.scrollBy(0, chatTalk.scrollHeight);
  };

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
      return extensions.reduce(
        (acc, e) => acc || fileName.indexOf(e) > 0,
        false
      );
    };

    const content =
      (m.files &&
        m.files.map(f => {
          return (
            <div key={f.id}>
              <a download href={f.file} style={{ display: "block" }}>
                {f.file}
              </a>
              {isImage(f.file) && (
                <img className="chat__message-image" src={f.file} alt="some" />
              )}
            </div>
          );
        })) ||
      "";

    return this.renderMessageTemplate(m, content);
  };

  renderMessages() {
    const activeChannel = this.findActiveChannel();
    const options = {
      onChange: this.handleMessageIntersection,
      root: ".chat__talk"
    };

    return (
      activeChannel &&
      activeChannel.messages.map(m => (
        <React.Fragment key={m.id}>
          <Observer {...options}>{this.renderMessage(m)}</Observer>
        </React.Fragment>
      ))
    );
  }

  renderRow = ({ index, parent, key, style }) => {
    const options = {
      onChange: this.handleMessageIntersection,
      root: ".chat__talk"
    };
    const activeChannel = this.findActiveChannel();
    const message = activeChannel && activeChannel.messages[index];

    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        parent={parent}
        columnIndex={0}
        rowIndex={index}
      >
        {
          <div style={style}>
            <Observer {...options}>{this.renderMessage(message)}</Observer>
          </div>
        }
      </CellMeasurer>
    );
  };

  findActiveChannel() {
    const { channels } = this.props;
    const { activeChannelId } = this.props;
    const activeChannel = channels.find(
      channel => channel.id === activeChannelId
    );
    return activeChannel;
  }

  handleMessageChange = e => {
    this.setState({
      currentMessage: e.target.value
    });
  };

  handleInputKeyPress = e => {
    if (e.charCode === 13) {
      this.handleSend();
    }
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

  handleFileUpload = () => {
    const form = this.formRef.current;
    const input = form.querySelector("input[type=file]");
    input.click();
  };

  handleFileChange = e => {
    const { userId, activeChannelId } = this.props;
    const formData = new FormData();
    const files = Array.prototype.map.call(e.target.files, f => f);
    formData.append("channelId", activeChannelId);
    files.forEach(f => {
      formData.append("file", f);
    });

    Actions.sendChatFile({ payload: formData, userId });
  };

  handleChangeChanel = channelId => {
    const { activePages } = this.props;
    const channel = this.props.channels.find(ch => channelId === ch.id);

    if (!channel.messages) {
      this.loadMessages(channelId);
    } else {
      Actions.setActiveChannel(channelId);
    }
  };

  loadMessages = channelId => {
    const { activePages } = this.props;
    const currentPage = activePages[channelId] || 1;
    Actions.getChannelMessages({ channelId, currentPage });
  };

  handleMessageIntersection = e => {
    const { target } = e;
    const { dataset } = target;
    const { userId } = this.props;
    const [channelId, messageId, seen] = dataset.id.split("-");
    console.log(dataset);
    if (e.isIntersecting && seen !== "true") {
      console.log("chatMarkAsRead");
      Actions.chatMarkAsRead({
        messageId,
        userId
      });
      requestAnimationFrame(() => {
        target.querySelector(".chat__message-seen").textContent = "✔";
      });
    }
  };

  loadMore() {
    const { activeChannelId } = this.props;
    const { channelHasMessages, isLoading, lastMessageId } = this.props;

    if (channelHasMessages[activeChannelId] === false || isLoading) {
      return false;
    }

    const { activePages } = this.props;
    const currentPage = activePages[activeChannelId] || 1;
    if (activeChannelId && currentPage) {
      Actions.getMoreMessages({
        activeChannelId,
        currentPage: currentPage + 1,
        lastMessageId
      });
    }
  }

  handleLoadMore = () => this.loadMore();

  handleListScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    const list = this.listRef.current;
    window.foo = list;
    // if (scrollTop === 0) {
    //   this.loadMore();
    //   setTimeout(() => {
    //     // debugger;

    //     // const currentTop = list.Grid.getTotalRowsHeight();
    //     // const diff = currentTop - scrollTop;
    //     // list.scrollToPosition();
    //     list.scrollToRow(2);
    //   }, 100);
    // }
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
    // const list = this.listRef.current;

    // setTimeout(() => list.scrollToRow(-1), 300);
    // setTimeout(() => list.scrollToRow(-1), 300);
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
    return Actions.postCreateChannel(fields);
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
    return Actions.postCreatePrivateChannel(fields);
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
    return Actions.postJoinChannel(fields);
  };

  renderChannelAvatar(avatar) {
    if (!avatar) return <div className="placeholder" />;
    return avatar.includes("http") ? (
      <img src={avatar} alt="logo" />
    ) : (
      <img src={avatar} alt="logo" />
    );
  }

  renderChatChanels() {
    const { activeChannelId } = this.props;
    const { channels } = this.props;

    const content = (
      <div>
        <Button onClick={this.handleCreatePrivateChat}>Чат</Button>
      </div>
    );

    return channels.map(channel => {
      const className = cn("chat__chanels-item", {
        "chat__chanels-item_active": activeChannelId === channel.id
      });

      return (
        <div
          key={channel.id}
          className={className}
          onClick={() => this.handleChangeChanel(channel.id)}
        >
          <div className="chat__chanels-avatar">
            <Popover content={content} trigger="contextMenu">
              {this.renderChannelAvatar(channel.avatar)}
            </Popover>
          </div>
          <div className="chat__chanels-title">{channel.name}</div>
        </div>
      );
    });
  }

  render() {
    const { visible, isLoading, socketError } = this.props;
    const { isSocketConnected } = this.state;
    console.log(isSocketConnected);
    const activeChannel = this.findActiveChannel();
    const messages = (activeChannel && activeChannel.messages) || [];
    const chatIndicatorCls = cn("chat__indicator", {
      chat__indicator_connected: isSocketConnected
    });

    const cache = new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 50
    });
    this.cache = cache;

    return (
      <div>
        {this.renderFileForm()}
        <Drawer
          className="chat"
          placement="right"
          visible={visible}
          onClose={this.props.onClose}
          width={720}
          closable={false}
        >
          <div className="chat__container">
            <div className="chat__search">
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  width: "50%"
                }}
              >
                <div className={chatIndicatorCls} />
                <Input placeholder="Поиск" style={{ width: "100%" }} />
              </div>
              <div className="chat__search-controls">
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
              </div>
            </div>

            <div className="chat__talks">
              <div className="chat__chanels">{this.renderChatChanels()}</div>
              <div
                className="chat__talk"
                ref={this.chatTalkRef}
                onScroll={this.handleChatScroll}
              >
                <div className="chat__talk-spin">{isLoading && <Spin />}</div>
                <div className="chat__talk-down">
                  <Button
                    size="large"
                    icon="down-circle"
                    onClick={this.handleScrollDown}
                  />
                </div>

                {this.renderMessages()}
                {/* <AutoSizer>
                  {({ width, height }) => {
                    return (
                      <List
                        ref={this.listRef}
                        overscanRowCount={20}
                        onScroll={this.handleListScroll}
                        rowCount={messages.length}
                        width={width}
                        height={height}
                        deferredMeasurementCache={this.cache}
                        rowHeight={this.cache.rowHeight}
                        rowRenderer={this.renderRow}
                      />
                    );
                  }}
                </AutoSizer> */}
              </div>
            </div>
            <div className="chat__controls">
              <div className="chat__controls-file-icon">
                <Icon
                  type="paper-clip"
                  style={{ fontSize: "16px", color: "#00ccff" }}
                  onClick={this.handleFileUpload}
                />
              </div>
              <Input
                ref={this.inputRef}
                disabled={isLoading || !activeChannel || !isSocketConnected}
                autoFocus
                value={this.state.currentMessage}
                onChange={this.handleMessageChange}
                onKeyPress={this.handleInputKeyPress}
              />
            </div>
          </div>
        </Drawer>
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
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    chat: state.Chat.chat,
    channels: state.Chat.channels,
    activeChannelId: state.Chat.activeChannelId,
    isLoading: state.Chat.isLoading,
    socketError: state.Chat.socketError,
    activePages: state.Chat.activePages,
    channelHasMessages: state.Chat.channelHasMessages,
    lastMessageId: state.Chat.lastMessageId
  };
};

export default connect(mapStateToProps)(Chat);
