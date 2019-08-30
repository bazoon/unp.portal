import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import moment from 'moment';
import { Scrollbars } from 'react-custom-scrollbars';
import ChannelAvatar from './ChannelAvatar';
import Channel from './Channel';

@inject("chatStore")
@observer
class SearchResults extends Component {
  renderFoundChanels() {
    const { foundChannels } = this.props.chatStore;
    return foundChannels.map(channel => <Channel key={channel.id} channel={channel} />);
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
          <ChannelAvatar avatar={avatar} />
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

  renderSearchResults() {
    return (
      <>
        <div className="chat__users">
          <Scrollbars
            autoHide
            universal
          >
            <div>{this.renderFoundChanels()}</div>
            <div>{this.renderFoundMessages()}</div>
          </Scrollbars>
        </div>
      </>
    );
  }

  render() {
    return this.renderSearchResults();
  }
}

export default SearchResults;