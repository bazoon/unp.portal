import React, { Component } from 'react';
import moment from 'moment';
import { observer, inject } from "mobx-react";

@inject("currentUserStore")
@observer
class Message extends Component {
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

  render() {
    const { message } = this.props;
    switch (message.type) {
      case "text": {
        return this.renderTextMessage(message);
      }
      case "file": {
        return this.renderFileMessage(message);
      }
      default: {
        return this.renderTextMessage(message);
      }
    }
  }
}

export default Message;