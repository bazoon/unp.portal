import React, { Component } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';
import { observer, inject } from "mobx-react";
import ChannelHeader from './ChannelHeader';
import MinusIcon from "../../../images/minus";
import UsersWindow from '../UsersWindow/UsersWindow';

@inject("chatStore")
@observer
class AdminPanel extends Component {

  handleRemoveUsersFromChannel = users => {
    return this.props.chatStore
      .removeUsersFromChannel({
        users
      });
  }

  render() {
    const activeChannel = this.props.chatStore.activeChannel || {};
    const channelParticipants = activeChannel.participants || [];

    return (
      <div className="chat__admin-panel">
        <ChannelHeader channel={activeChannel} />
        <div className="chat__admin-panel-participants">
          <Scrollbars
            autoHide
            universal
          >
            {
              channelParticipants.map(p => {
                return (
                  <div key={p.id} className="chat__admin-panel-participant">
                    {
                      activeChannel.canManage && (
                        <MinusIcon style={{ marginRight: '16px', cursor: 'pointer' }} onClick={() => this.handleRemoveUsersFromChannel([p.id])} />
                      )
                    }
                    <img className="avatar avatar_medium" src={p.avatar} />
                    <div>
                      {p.name}
                    </div>
                  </div>
                );
              })
            }
          </Scrollbars>
        </div>


      </div>
    );
  }
}

export default AdminPanel;
