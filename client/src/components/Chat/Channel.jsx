import React, { Component } from 'react';
import { Badge } from 'antd';
import cn from "classnames";
import moment from "moment";
import ChannelAvatar from './ChannelAvatar';

class Channel extends Component {
  render() {
    const { channel, isActive, onChange } = this.props;
    const className = cn("chat__channels-item", {
      "chat__channels-item_active": isActive
    });

    const { name } = channel;
    const { userName, message, createdAt } = channel.lastMessage || {};
    const date = createdAt && moment(createdAt).format("HH:mm");
    const { unreads } = channel;

    return (
      <div
        key={channel.id}
        className={className}
        onClick={() => onChange(channel.id)}
      >
        <div className="chat__channels-avatar">
          <ChannelAvatar avatar={channel.avatar} />
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
}

export default Channel;
