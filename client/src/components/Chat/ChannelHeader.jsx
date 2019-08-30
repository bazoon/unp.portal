import React, { Component } from 'react';
import { observer, inject } from "mobx-react";
import { Popover, Upload } from 'antd';
import MoreIcon from "../../../images/more";
import ChannelAvatar from './ChannelAvatar';
import { pluralizeParticipants } from "../../utils/pluralize";
import ChatLeaveIcon from "../../../images/chatLeave";
import AddAvatarIcon from "../../../images/addAvatar";
import AddUserIcon from "../../../images/addUser";
import UserIcon from "../../../images/user";

@inject("chatStore")
@observer
class ChannelHeader extends Component {

  handleUploadChannelAvatar = ({ file }) => {
    const formData = new FormData();
    const { id } = this.props.chatStore.activeChannel;
    formData.append("id", id);
    formData.append("file", file);
    this.props.chatStore.updateChannelAvatar({ id, payload: formData });
  }


  renderOperationsMenu(channel) {
    return (
      <div className="operations-menu" style={{ width: "250px" }}>
        {/* <div onClick={() => this.props.onEdit()}>Удаление диалога</div> */}
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => this.leaveChannel(channel)}>
          <ChatLeaveIcon width="17px" />
          Выйти из чата
        </div>
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => this.props.chatStore.showAddUsersWindow()}>
          <AddUserIcon width="19px" />
          Добавить пользователя
        </div>
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => this.props.chatStore.switchToAdmin()}>
          <UserIcon width={20} />
          Участники
        </div>
        <div className="operations-menu__item operations-menu__item_with-margin" onClick={() => { }}>
          <AddAvatarIcon />
          <Upload
            onChange={this.handleUploadChannelAvatar}
            beforeUpload={() => false}
            multiple
            showUploadList={false}
          >
            <div className="operations-menu__item">
              Загрузить аватар
            </div>
          </Upload>
        </div>


      </div>
    );
  }

  render() {
    const { channel } = this.props;
    const participants = channel && channel.participants;
    const participantsCount = participants && participants.length;
    const avatar = channel && channel.avatar;

    return (
      <div className="chat__channel__top">
        {channel && (
          <div className="chat__channel__top-wrap">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="chat__channel__top-avatar">
                <ChannelAvatar avatar={avatar} />
              </div>
              <div className="chat__channel-name">
                {channel && channel.name}
                <div className="chat__channel-count">
                  {pluralizeParticipants(participantsCount)}
                </div>
              </div>
            </div>
            <div className="chat__channel-menu">
              <Popover
                placement="bottomRight"
                content={this.renderOperationsMenu(channel)}
                trigger="click"
              >
                <div className="operations-menu__icon">
                  <MoreIcon />
                </div>
              </Popover>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ChannelHeader;