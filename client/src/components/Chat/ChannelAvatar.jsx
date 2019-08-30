import React, { Component } from 'react';

class ChannelAvatar extends Component {
  render() {
    const { avatar } = this.props;
    if (!avatar) return <div className="placeholder" />;
    return avatar.includes("http") ? (
      <img src={avatar} alt="logo" />
    ) : (
        <img src={avatar} alt="logo" />
      );
  }
}

export default ChannelAvatar;
