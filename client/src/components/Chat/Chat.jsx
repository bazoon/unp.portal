import React, { Component } from "react";
import { Scrollbars } from 'react-custom-scrollbars';
import { Drawer, Input } from "antd";
import PropTypes from "prop-types";
import "intersection-observer";
import { observer, inject } from "mobx-react";
import "./Chat.less";
import ChatChannelsIcon from "../../../images/chatChannels";
import AddChatIcon from "../../../images/addChat";
import ChatUserIcon from "../../../images/chatUser";
import UsersWindow from "../UsersWindow/UsersWindow";
import Channel from './Channel';
import ChannelCreation from './ChannelCreation';
import Messages from './Messages';
import AdminPanel from './AdminPanel';
import chatStates from './states';
import SearchResults from './SearchResults';
import Users from './Users';

@inject("currentUserStore")
@inject("usersStore")
@inject("chatStore")
@observer
class Chat extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    chat: PropTypes.arrayOf(PropTypes.object),
    channels: PropTypes.arrayOf(PropTypes.object),
  };

  static defaultProps = {
    chat: [],
    channels: []
  };

  constructor(props) {
    super(props);
    this.state = {
      chatState: chatStates.chat,
      isUploadVisible: false,
      files: [],
      selectedUserId: undefined,
    };
    this.formRef = React.createRef();
    this.chatTalkRef = React.createRef();
    this.inputRef = React.createRef();
    this.listRef = React.createRef();
  }

  componentDidMount = () => {
    this.props.chatStore.getChannels();
    this.props.usersStore.loadAllUsers();
  };

  componentDidUpdate = () => {
    // this.scrollChatTalk();
    // this.inputRef.current && this.inputRef.current.focus();
  };

  scrollChatTalk = () => {
    const chatTalk = this.chatTalkRef.current;
    if (!chatTalk) return;
    chatTalk.scrollBy(0, chatTalk.scrollHeight);
  };


  leaveChannel(channel) {
    this.props.chatStore.leaveChannel({ id: channel.id });
  }

  removeUsersFromChat() {
    this.setState({
      chatState: chatStates.admin
    });
  }

  handleAddEmoji = ({ native }) => {
    this.props.chatStore.setCurrentMessage(this.props.chatStore.currentMessage + native);
  }

  // renders
  handleChangeChanel = (channelId) => {
    this.props.chatStore.setActiveChannel(channelId).then(() => {
      this.props.chatStore.switchToChat();
    });
  };

  handleOpenChannelAtMessage = (channelId, messageId) => {
    this.props.chatStore.openChannelAtMessage(channelId, messageId).then(() => {
      const messageElement = document.querySelector(`#message-${messageId}`);
      messageElement && messageElement.scrollIntoView();
    });
  };

  loadMoreTop() {
    if (
      this.props.chatStore.activeChannel
      && this.props.chatStore.activeChannel.hasMoreMessagesTop
    ) {
      this.props.chatStore.activeChannel.loadMoreMessagesTop();
      return true;
    }
    return false;
  }

  loadMoreBottom() {
    if (
      this.props.chatStore.activeChannel
      && this.props.chatStore.activeChannel.hasMoreMessagesBottom
    ) {
      this.props.chatStore.activeChannel.loadMoreMessagesBottom();
      return true;
    }
    return false;
  }

  handleLoadMore = () => this.loadMore();

  handleListScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
    const list = this.listRef.current;

    if (scrollTop <= 100) {
      this.loadMore();
      // setTimeout(() => {
      //   // debugger;

      //   // const currentTop = list.Grid.getTotalRowsHeight();
      //   // const diff = currentTop - scrollTop;
      //   // list.scrollToPosition();
      //   list.scrollToRow(2);
      // }, 100);
    }
  };

  handleChatScroll = e => {
    const { target } = e;
    const { scrollTop, scrollHeight, offsetHeight } = target;

    if (scrollTop === 0) {
      if (this.loadMoreTop() !== false) {
        setTimeout(() => {
          target.scrollTop = 100;
        });
      }
    } else if (offsetHeight + scrollTop == scrollHeight) {
      this.loadMoreBottom();
    }
  };

  handleScrollDown = () => {
    const chatTalks = this.chatTalkRef.current;
    chatTalks.scrollTop = chatTalks.scrollHeight;
  };

  handleViewMessages = () => {
    this.props.chatStore.switchToChat();
  };

  handleCreateGroup = () => {
    this.props.chatStore.switchToCreate();
  };

  handleToggleUsers = () => {
    this.props.chatStore.switchToPrivate();
  };


  handleSearch = ({ target }) => {
    const { value } = target;

    this.props.chatStore.searchChannels(value);
    this.props.chatStore.searchMessages(value);

    if (value) {
      this.props.chatStore.switchToSearch();
    } else {
      this.props.chatStore.switchToChat();
    }
  };

  handleOnCreateGroup = (payload) => {
    return this.props.chatStore.createChannel(payload).then(() => {
      this.handleViewMessages();
    });
  }

  handleAddUsersToChannel = users => {
    return this.props.chatStore.addUsersToChannel({ users }).then(() => {
      this.props.chatStore.hideAddUsersWindow();
    });
  };


  // renders

  renderChatChanels() {
    const { channels, activeChannel } = this.props.chatStore;
    return channels.map(channel => {
      const isActive = channel.id === (activeChannel && activeChannel.id);
      return (
        <Channel
          key={channel.id}
          channel={channel}
          isActive={isActive}
          onChange={this.handleChangeChanel}
        />
      );
    });
  }

  renderFooter(chatState) {
    return (
      <div className="chat__footer-controls">
        <ChatChannelsIcon
          isActive={chatState === chatStates.chat}
          onClick={this.handleViewMessages}
        />
        <AddChatIcon
          isActive={chatState === chatStates.create}
          onClick={this.handleCreateGroup}
        />
        <ChatUserIcon
          isActive={chatState === chatStates.private}
          onClick={this.handleToggleUsers}
        />
      </div>
    );
  }

  render() {
    const { visible, isLoading, socketError } = this.props;
    const { isAddUsersWindowVisible, chatState } = this.props.chatStore;

    return (
      <>
        <Drawer
          className="chat"
          placement="right"
          visible={visible}
          onClose={this.props.onClose}
          width={720}
          closable={false}
        >
          <div className="chat__container">
            <div className="chat__left-panel">
              <div className="chat__search">
                <Input.Search
                  placeholder="Поиск по чату"
                  style={{ width: "100%" }}
                  onChange={this.handleSearch}
                />
              </div>

              {(chatState === chatStates.chat || chatState === chatStates.admin) && (
                <div className="chat__channels">

                  <Scrollbars
                    autoHide
                    universal
                  >
                    {this.renderChatChanels()}
                  </Scrollbars>
                </div>
              )}

              {chatState === chatStates.create && (
                <div className="chat__channels" />
              )}

              {chatState === chatStates.private && (
                <Scrollbars
                  autoHide
                  universal
                >
                  <div className="chat__users">
                    <Users />
                  </div>
                </Scrollbars>
              )}

              {chatState === chatStates.search && (
                <SearchResults />
              )}

              {this.renderFooter(chatState)}
            </div>
            <div className="chat__right-panel">
              <div className="chat__talk">
                {(chatState === chatStates.chat
                  || chatState === chatStates.search)
                  && <Messages onUpload={this.handleUploadFiles} />}
                {chatState === chatStates.private && <div />}
                {chatState === chatStates.create && <ChannelCreation users={this.props.usersStore.users} onCreate={this.handleOnCreateGroup} />}
                {chatState === chatStates.admin &&
                  <AdminPanel />
                }
              </div>
            </div>
          </div>
        </Drawer>

        {
          isAddUsersWindowVisible && (
            <UsersWindow
              onCancel={this.props.chatStore.hideAddUsersWindow}
              visible={isAddUsersWindowVisible}
              onOk={this.handleAddUsersToChannel}
            />
          )
        }


      </>
    );
  }
}

export default Chat;
