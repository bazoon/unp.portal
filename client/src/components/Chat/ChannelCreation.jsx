import React, { Component } from 'react';
import { Button, Upload, Input, Checkbox, notification } from 'antd';
import { Scrollbars } from 'react-custom-scrollbars';

class ChannelCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      channelAvatar: undefined,
      selectedGroupUsers: {},
      channelName: "",
      isAllGroupUsersSelected: false
    };
  }
  componentWillUnmount() {
    this.isUnmounted = true;
  }

  handleChannelAvatarChanged = value => {
    this.setState({
      channelAvatar: value.fileList
    });
  };

  handleSelectGroupUser = id => {
    const checked = this.state.selectedGroupUsers[id];
    this.setState({
      selectedGroupUsers: { ...this.state.selectedGroupUsers, [id]: !checked }
    });
  };

  handleChangeChannelName = e => {
    this.setState({
      channelName: e.target.value
    });
  };

  handleSelectAllGroupUsers = () => {
    const { users } = this.props;
    const { isAllGroupUsersSelected } = this.state;
    const { selectedGroupUsers } = this.state;

    users.forEach((u) => {
      selectedGroupUsers[u.id] = !isAllGroupUsersSelected;
    });

    this.setState({
      selectedGroupUsers: { ...selectedGroupUsers },
      isAllGroupUsersSelected: !isAllGroupUsersSelected
    });
  }

  handleCreateChannel = () => {
    const { selectedGroupUsers, channelName, channelAvatar } = this.state;
    const { onCreate } = this.props;

    if (!channelName) {
      notification.warn({
        message: "Укажите имя группы"
      });
      return;
    }

    const usersIds = Object.keys(selectedGroupUsers).reduce((acc, key) => {
      return selectedGroupUsers[key] ? acc.concat([key]) : acc;
    }, []);

    const file = channelAvatar && channelAvatar[0] && channelAvatar[0].originFileObj;

    const formData = new FormData();
    formData.append("usersIds", JSON.stringify(usersIds));
    formData.append("channelName", channelName);
    formData.append("channelAvatar", file);

    onCreate(formData).then(() => {
      if (!this.isUnmounted) {
        this.setState({
          channelName: "",
          channelAvatar: "",
          selectedGroupUsers: {}
        });
      }
    });
  };

  render() {
    const { users } = this.props;
    return (
      <div className="chat__group-creation">
        <div className="chat__group-creation-header">
          <div>
            <div className="chat__group-creation-title">Групповой чат</div>
            <div className="chat__group-creation-title chat__group-creation-title_sub">
              Добавление пользователей
            </div>
          </div>
          <Button type="primary" onClick={this.handleCreateChannel}>
            Создать
          </Button>
        </div>
        <div className="chat__group-creation-input">
          <Upload
            onChange={this.handleChannelAvatarChanged}
            fileList={this.state.channelAvatar}
            beforeUpload={() => false}
          >
            <div className="chat__group-creation-upload">
              Загрузить аватарку
            </div>
          </Upload>
        </div>
        <div className="chat__group-creation-input">
          <Input
            value={this.state.channelName}
            placeholder="Введите название группы"
            onChange={this.handleChangeChannelName}
            required
          />
        </div>
        <div className="chat__group-creation-users">
          <div className="chat__group-creation-select">
            <div className="chat__group-creation-select-all">
              Выделить всех
            </div>
            <Checkbox
              checked={this.state.isAllGroupUsersSelected}
              onClick={() => this.handleSelectAllGroupUsers()}
            />
          </div>
          <Scrollbars
            autoHide
            universal
          >
            {users.map(user => {
              const checked = this.state.selectedGroupUsers[user.id];
              return (
                <div key={user.id} className="chat__group-creation-user">
                  <div className="chat__group-creation-user-wrap">
                    <img
                      className="chat__group-creation-user-avatar"
                      src={user.avatar}
                      alt="Group avatar"
                    />
                    <div className="chat__group-creation-user-name">
                      {user.name}
                    </div>
                  </div>
                  <Checkbox
                    checked={checked}
                    onClick={() => this.handleSelectGroupUser(user.id)}
                  />
                </div>
              );
            })}
          </Scrollbars>
        </div>
      </div>
    );
  }
}

export default ChannelCreation;
