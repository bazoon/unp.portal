import React, { Component } from "react";
import moment from "moment";
import { Input, Tooltip, Icon, Button, Breadcrumb, Row, Col } from "antd";
import { Link } from "react-router-dom";
import Files from "../Files/Files";
import { observer, inject } from "mobx-react";
import UploadWindow from "../UploadWindow/UploadWindow";
import Calendar from "../Calendar/Calendar";

@inject("eventsStore")
@inject("currentUserStore")
@observer
class Conversation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploadVisible: false,
      files: []
    };
  }

  componentDidMount = () => {
    const { id } = this.props.match.params;
    this.props.eventsStore.get(id);
  };

  handleFileChange = files => {
    this.setState({
      files
    });
  };

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

  handleDeleteFile = id => {
    this.props.eventsStore.deleteFile(id);
  };

  handleUploadFiles = () => {
    const { id } = this.props.match.params;
    const formData = new FormData();
    formData.append("eventId", id);

    this.state.files.forEach(f => {
      formData.append("file", f.originFileObj);
    });

    this.props.eventsStore.uploadFiles(formData);
    this.handleHideUpload();
  };

  renderEvent(event) {
    const {
      id,
      title,
      description,
      startDate,
      usersCount,
      userName,
      userAvatar
    } = event || {};

    const date = event && moment(event.created_at).fromNow();
    const files = (event && (event.files && event.files.slice())) || [];
    return (
      <div key={id} className="single-event">
        <div className="single-event__header">
          <div className="single-event__avatar">
            <img src={userAvatar} />
          </div>
          <div className="single-event__user">{userName}</div>
          <div className="single-event__date">{date}</div>
        </div>
        <div className="single-event__title">{title}</div>
        <div className="single-event__description">{description}</div>
        <div className="single-event__files">
          <Files files={files} onDelete={this.handleDeleteFile} />
          <Button onClick={this.handleShowUpload} icon="upload">
            Добавить файл
          </Button>
          <UploadWindow
            visible={this.state.isUploadVisible}
            onCancel={this.handleHideUpload}
            onChange={this.handleFileChange}
            onOk={this.handleUploadFiles}
            value={this.state.files}
          />
        </div>
      </div>
    );
  }

  render() {
    const { title } = this.props.eventsStore.currentEvent || {};

    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/events">События</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={27}>
          <Col span={16}>
            <div>{this.renderEvent(this.props.eventsStore.currentEvent)}</div>
          </Col>
          <Col span={8}>
            <Calendar />
          </Col>
        </Row>
      </>
    );
  }
}

export default Conversation;
