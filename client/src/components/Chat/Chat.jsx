import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import cn from "classnames";
import moment from "moment";
import { Drawer, Input, Button, Icon, Spin } from "antd";
import PropTypes from "prop-types";
import socketIOClient from "socket.io-client";
import Observer from "@researchgate/react-intersection-observer";
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache
} from "react-virtualized";

const socket = socketIOClient(location.host, {
  query: {
    token: localStorage.getItem("token"),
    expiresIn: localStorage.getItem("expiresIn")
  }
});

function hashCode(string) {
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
    chat: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    chat: []
  };

  constructor(props) {
    super(props);
    this.state = {
      currentMessage: "",
      activeChannelId: undefined
    };
    this.formRef = React.createRef();
    this.chatTalkRef = React.createRef();
    this.inputRef = React.createRef();
    this.listRef = React.createRef();
  }

  componentDidMount = () => {
    Actions.getChat();

    socket.on("channel-message", () => {
      Actions.getChat();
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    // this.scrollChatTalk();
    this.inputRef.current && this.inputRef.current.focus();
  };

  handleSend = () => {
    Actions.sendChatMessage({
      channelId: this.state.activeChannelId,
      message: this.state.currentMessage,
      type: "text"
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
    const { activeChannelId } = this.state;

    const messageId = `${activeChannelId}-${m.id}`;
    const hash = Math.abs(hashCode(m.author));
    const index = hash % 10;
    const colorStyle = {
      color: `#${colors[index]}`
    };

    return (
      <div className="chat__message" key={m.id} data-id={messageId}>
        <div className="chat__message-avatar">
          {m.avatar && <img src={m.avatar} alt={m.author} />}
        </div>
        <div style={colorStyle} className="chat__message-author">
          {m.author}
        </div>
        {content}
        <div className="chat__message-date">
          {moment(m.date).format("HH:mm")}
        </div>
      </div>
    );
  };

  renderTextMessage = m => {
    return this.renderMessageTemplate(m, m.content);
  };

  renderFileMessage = m => {
    const isImage = fileName => {
      const extensions = ["jpg", "jpeg", "svg", "JPG"];
      return extensions.reduce(
        (acc, e) => acc || fileName.indexOf(e) > 0,
        false
      );
    };

    const content = m.content.map(f => {
      const downloadUrl = `/uploads/${f}`;
      return (
        <div key={f}>
          <a download href={downloadUrl} style={{ display: "block" }}>
            {f}
          </a>
          {isImage(f) && (
            <img className="chat__message-image" src={downloadUrl} alt="some" />
          )}
        </div>
      );
    });

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
    const message = activeChannel.messages[index];

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
    const { chat } = this.props;
    const { activeChannelId } = this.state;
    const activeChannel = chat.find(channel => channel.id === activeChannelId);
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
    const formData = new FormData();
    const { activeChannelId } = this.state;
    const files = Array.prototype.map.call(e.target.files, f => f);
    formData.append("channelId", activeChannelId);
    files.forEach(f => {
      formData.append("file", f);
    });

    Actions.sendChatFile(formData);
  };

  handleChangeChanel = channelId => {
    const { activeChannelId } = this.state;
    this.setState({
      activeChannelId: channelId
    });
  };

  handleMessageIntersection = e => {
    const { target } = e;
    const { dataset } = target;
    const [channelId, messageId] = dataset.id.split("-");

    if (e.isIntersecting) {
      Actions.chatMarkAsRead({
        channelId,
        messageId
      });
      // setTimeout(() => {
      //   target.querySelector(".chat__message-author").style.background = "gray";
      // }, 500);
    } else {
      // setTimeout(() => {
      //   target.querySelector(".chat__message-author").style.background =
      //     "silver";
      // }, 500);
    }
  };

  handleLoadMore = () => {
    Actions.getMoreMessages(this.state.activeChannelId);
  };

  handleListScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    if (scrollTop === 0) {
      Actions.getMoreMessages(this.state.activeChannelId);

      setTimeout(() => {
        // debugger;
        const list = this.listRef.current;
        window.foo = list;
        // const currentTop = list.Grid.getTotalRowsHeight();
        // const diff = currentTop - scrollTop;
        // list.scrollToPosition();
        list.scrollToRow(2);
      }, 100);
    }
  };

  handleScrollDown = () => {
    const list = this.listRef.current;

    setTimeout(() => list.scrollToRow(-1), 300);
    setTimeout(() => list.scrollToRow(-1), 300);
  };

  renderChatChanels() {
    const { activeChannelId } = this.state;
    const { chat } = this.props;

    return chat.map(channel => {
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
            <img src={channel.avatar} alt="logo" />
          </div>
          <div className="chat__chanels-title">{channel.title}</div>
        </div>
      );
    });
  }

  render() {
    const { visible, isLoading, socketError } = this.props;
    const activeChannel = this.findActiveChannel();
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
              <Input placeholder="Поиск" style={{ width: "50%" }} />
              <Button icon="more" onClick={this.handleLoadMore} />
            </div>

            <div className="chat__talks">
              <div className="chat__chanels">{this.renderChatChanels()}</div>
              <div className="chat__talk" ref={this.chatTalkRef}>
                <div className="chat__talk-spin">{isLoading && <Spin />}</div>
                <div className="chat__talk-down">
                  <Button
                    size="large"
                    icon="down-circle"
                    onClick={this.handleScrollDown}
                  />
                </div>

                {/* {this.renderMessages()} */}
                <AutoSizer>
                  {({ width, height }) => {
                    return (
                      <List
                        ref={this.listRef}
                        overscanRowCount={20}
                        onScroll={this.handleListScroll}
                        rowCount={
                          (activeChannel && activeChannel.messages.length) || 0
                        }
                        width={width}
                        height={height}
                        deferredMeasurementCache={this.cache}
                        rowHeight={this.cache.rowHeight}
                        rowRenderer={this.renderRow}
                      />
                    );
                  }}
                </AutoSizer>
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
                disabled={isLoading || !activeChannel}
                autoFocus
                value={this.state.currentMessage}
                onChange={this.handleMessageChange}
                onKeyPress={this.handleInputKeyPress}
              />
            </div>
          </div>
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    chat: state.Chat.chat,
    isLoading: state.Chat.isLoading,
    socketError: state.Chat.socketError
  };
};

export default connect(mapStateToProps)(Chat);
