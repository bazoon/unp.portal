import React, { Component } from "react";
import moment from "moment";
import { Drawer, Input, Button, Icon } from "antd";
import PropTypes from "prop-types";
import api from "../../api/api";

class Chat extends Component {
  static propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      currentMessage: ""
    };
    this.formRef = React.createRef();
  }

  handleSend = () => {
    const messages = [...this.state.messages, this.state.currentMessage];
    this.setState({
      messages,
      currentMessage: ""
    });
  };

  handleFileSend = fileMessage => {
    const messages = [...this.state.messages, fileMessage];
    this.setState({
      messages
    });
  };

  renderMessage = m => {
    const d = new Date();
    return (
      <div className="chat__message" key={m}>
        <div className="chat__message-date">{moment(d).format("HH:mm")}</div>
        {typeof m === "object" ? this.rendComplexObject(m) : m}
      </div>
    );
  };

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
    const config = { headers: { "Content-Type": "multipart/form-data" } };
    const formData = new FormData();
    const files = Array.prototype.map.call(e.target.files, f => f);
    files.forEach(f => {
      formData.append("file", f);
    });
    api.post("upload", formData, config).then(response => {
      this.handleFileSend(response.data);
    });
  };

  render() {
    const { visible } = this.props;
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
              <div className="chat__chanels">
                <div className="chat__chanels-item chat__chanels-item_active">
                  <div className="chat__chanels-avatar">
                    <img src="https://fakeimg.pl/50x50" alt="logo" />
                  </div>
                  <div className="chat__chanels-title">
                    Региональные проекты
                  </div>
                </div>
                <div className="chat__chanels-item">
                  <div className="chat__chanels-avatar">
                    <img src="https://fakeimg.pl/50x50" alt="logo" />
                  </div>
                  <div className="chat__chanels-title">Петр Петров</div>
                </div>
                <div className="chat__chanels-item">
                  <div className="chat__chanels-avatar">
                    <img src="https://fakeimg.pl/50x50" alt="logo" />
                  </div>
                  <div className="chat__chanels-title">Иванов И.В.</div>
                </div>
              </div>

              <div className="chat__talk">
                {this.state.messages.map(m => this.renderMessage(m))}
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

export default Chat;
