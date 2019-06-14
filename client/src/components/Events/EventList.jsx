import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import "./Events.less";
import moment from "moment";
import { Icon, Button, Row, Col, Breadcrumb, Input, Pagination } from "antd";
import prettyBytes from "pretty-bytes";
import getFileIcon from "../../utils/getFileIcon";
import { Link } from "react-router-dom";
import CreateEventForm from "./CreateEventForm";
import { inject, observer } from "mobx-react";
import Events from "./Events";

const { Search } = Input;

@inject("eventsStore")
@inject("currentUserStore")
@observer
class EventList extends Component {
  static defaultProps = {
    events: []
  };

  constructor(props) {
    super(props);
    this.state = {
      isFormVisible: false,
      isFilesVisible: {},
      today: moment(new Date())
    };
  }

  componentDidMount() {
    this.loadEvents();
  }

  loadEvents() {
    const { userId } = this.props;
    const { today } = this.state;
    const now = new Date();
    this.props.eventsStore.loadAll();
  }

  handleToggleFiles = id => {
    const { isFilesVisible } = this.state;
    isFilesVisible[id] = !isFilesVisible[id];

    this.setState({
      isFilesVisible: { ...isFilesVisible }
    });
  };

  handleDownloadAll = id => {
    const links = document.querySelectorAll(`#event-${id} a`);
    Array.prototype.forEach.call(links, link => link.click());
  };

  handleBackward = () => {
    const { today } = this.state;
    today.subtract(1, "days");
    this.setState({
      today: moment(today)
    });
  };

  handleForward = () => {
    const { today } = this.state;
    today.add(1, "days");

    this.setState({
      today: moment(today)
    });
  };

  handleCancel = () => {
    this.setState({
      isFormVisible: false
    });
  };

  handleCreateSuccess = () => {
    this.setState({
      isFormVisible: false
    });
  };

  renderEvent = event => {
    const from = moment(event.fromDate).format("HH:mm");
    return (
      <div key={event.id} id={`event-${event.id}`} className="event__wrapper">
        <div className="event__time">{from}</div>
        <div className="event__info">
          <h2>{event.title}</h2>
          <div>{event.description}</div>
          {this.renderFilesControls(event)}
        </div>
      </div>
    );
  };

  renderFilesControls = ({ id, files }) => {
    const { isFilesVisible } = this.state;
    return (
      <>
        {files.length > 0 && (
          <div
            className="event__wrapper-show-files"
            onClick={() => this.handleToggleFiles(id)}
          >
            {isFilesVisible[id] ? (
              <span>Скрыть вложения</span>
            ) : (
              <span>Показать вложения</span>
            )}
            &nbsp;
            {isFilesVisible[id] ? <Icon type="up" /> : <Icon type="down" />}
          </div>
        )}
        {isFilesVisible[id] && this.renderEventFiles(id, files)}
      </>
    );
  };

  renderEventFiles(id, files) {
    return (
      <div className="event__wrapper-files">
        {files &&
          files.map(f => {
            const downloadUrl = `/uploads/${f.name}`;
            const fileSize = prettyBytes(f.size, { locale: "ru" });
            return (
              <div key={f.name} className="event__wrapper-file">
                <a download href={downloadUrl} style={{ display: "block" }}>
                  <Icon
                    type={getFileIcon(f.name)}
                    style={{ fontSize: "32px" }}
                  />
                </a>

                <div className="event__wrapper-file-details">
                  <div className="event__wrapper-file-name">{f.name}</div>
                  <div className="event__wrapper-file-size">{fileSize}</div>
                </div>
              </div>
            );
          })}
        {files && (
          <Button size="small" onClick={() => this.handleDownloadAll(id)}>
            Скачать все
          </Button>
        )}
      </div>
    );
  }

  getTodayEvents() {
    const { today } = this.state;
    const { events } = this.props;
    return events.filter(event => {
      return moment(event.fromDate).isSame(today, "day");
    });
  }

  handleAddEvent = () => {
    this.setState({
      isFormVisible: true
    });
  };

  handleChangePagination = page => {
    this.props.eventsStore.setPage(page);
  };

  renderEvents() {
    const groups = this.props.eventsStore.groupedByDays;
    return (
      <div className="event-list">
        <Events groups={groups} />
      </div>
    );
  }

  render() {
    const { isFormVisible } = this.state;
    const { avatar, userName } = this.props.currentUserStore;

    return (
      <div className="events">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>События</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={27}>
          <Col span={16}>
            <div className="project-groups__search">
              <Search placeholder="Поиск по событиям" />
            </div>
          </Col>
          <Col span={8}>
            <div className="side-header">События</div>
            <Button
              type="primary"
              style={{ width: "100%", height: "52px" }}
              onClick={this.handleAddEvent}
            >
              Создать событие
            </Button>
          </Col>
        </Row>

        <Row gutter={27}>
          <Col span={16}>
            <div className="project-groups__header">Ваши события</div>
            {isFormVisible && (
              <CreateEventForm
                avatar={avatar}
                userName={userName}
                onCancel={this.handleCancel}
                onSuccess={this.handleCreateSuccess}
              />
            )}

            {this.renderEvents()}
            <Pagination
              showQuickJumper
              onChange={this.handleChangePagination}
              total={this.props.eventsStore.total}
              pageSize={10}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default EventList;
