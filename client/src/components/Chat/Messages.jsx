import React, { Component } from 'react';
import { Input, Popover } from "antd";
import Observer from "@researchgate/react-intersection-observer";
import { Scrollbars } from 'react-custom-scrollbars';
import moment from 'moment';
import { observer, inject } from "mobx-react";
import { Picker } from 'emoji-mart';
import groupBy from "lodash/groupBy";
import FileIcon from "../../../images/folder";
import EmojiIcon from "../../../images/emoji";
import 'emoji-mart/css/emoji-mart.css';
import SendIcon from "../../../images/telesend";
import Message from './Message';
import ChannelHeader from './ChannelHeader';
import UploadWindow from "../UploadWindow/UploadWindow";


@inject("chatStore")
@inject("currentUserStore")
@observer
class Messages extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isUploadVisible: false,
    };
  }

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

  handleFileChange = files => {
    this.setState({
      files
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



  handleMessageChange = e => {
    this.props.chatStore.setCurrentMessage(e.target.value);
  };

  handleInputKeyPress = e => {
    if (e.charCode === 13) {
      this.handleSend();
    }
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

  handleMessageIntersection = e => {
    const { target } = e;
    const { dataset } = target;
    const [messageId, seen] = dataset.id.split("-");

    if (e.isIntersecting && seen !== "true") {
      this.props.chatStore.markAsRead({
        messageId
      });

      target.setAttribute("data-id", `${messageId}-true`);
    }
  };

  render() {
    const { activeChannel, currentMessage } = this.props.chatStore;
    const messages = activeChannel && activeChannel.messages;

    const options = {
      onChange: this.handleMessageIntersection,
      root: ".chat__talk"
    };

    const groupedMessages = groupBy(messages, m => {
      return moment(m.createdAt).format("DD MMMM YYYY");
    });

    const days = Object.keys(groupedMessages);

    return (
      <div className="chat__messages-box">
        <ChannelHeader channel={activeChannel} />
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
              const dayMessages = groupedMessages[day];

              return (
                <React.Fragment key={day}>
                  <div className="chat__messages-day">{day}</div>
                  {dayMessages.map(m => (
                    <React.Fragment key={m.id}>
                      <Observer {...options}><Message message={m} /></Observer>
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
                value={currentMessage}
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
}

export default Messages;