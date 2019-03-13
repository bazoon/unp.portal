import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import cn from "classnames";
import moment from "moment";
import { Drawer, Input, Button, Icon, Spin } from "antd";
import PropTypes from "prop-types";
import api from "../../api/api";

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
      messages: [],
      currentMessage: "",
      activeChannelId: 1
    };
    this.formRef = React.createRef();
    this.chatTalkRef = React.createRef();
  }

  componentDidMount = () => {
    Actions.getChat();
  };

  componentDidUpdate = (prevProps, prevState) => {
    this.scrollChatTalk();
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

  renderTextMessage = m => {
    return (
      <div className="chat__message" key={m.id}>
        <div className="chat__message-date">
          {moment(m.date).format("HH:mm")}
        </div>
        {m.content}
      </div>
    );
  };

  renderFileMessage = m => {
    return (
      <div className="chat__message" key={m.id}>
        <div className="chat__message-date">
          {moment(m.date).format("HH:mm")}
        </div>
        {m.content.map(f => (
          <div key={f}>
            <a download href={`/uploads/${f}`} style={{ display: "block" }}>
              {f}
            </a>
          </div>
        ))}
      </div>
    );
  };

  renderMessages() {
    const { chat } = this.props;
    const { activeChannelId } = this.state;
    const activeChannel = chat.find(channel => channel.id === activeChannelId);
    return (
      activeChannel && activeChannel.messages.map(m => this.renderMessage(m))
    );
  }

  rendComplexObject = m => {
    return m.map(f => (
      <a
        key={f.filename}
        download
        href={`/uploads/${f.filename}`}
        style={{ display: "block" }}
      >
        {f.originalname}
      </a>
    ));
  };

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
    this.setState({
      activeChannelId: channelId
    });
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
    const { visible, isLoading } = this.props;
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
              <Button icon="more" />
            </div>

            <div className="chat__talks">
              <div className="chat__chanels">{this.renderChatChanels()}</div>

              <div className="chat__talk" ref={this.chatTalkRef}>
                <div className="chat__talk-spin">{isLoading && <Spin />}</div>
                {this.renderMessages()}
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
                disabled={isLoading}
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
  return { chat: state.Chat.chat, isLoading: state.Chat.isLoading };
};

export default connect(mapStateToProps)(Chat);
