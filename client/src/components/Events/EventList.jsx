import React, { Component } from "react";
import "./Events.less";
import moment from "moment";
import { Icon, Button, Row, Col, Breadcrumb, Input, Pagination } from "antd";
import prettyBytes from "pretty-bytes";
import getFileIcon from "../../utils/getFileIcon";
import { Link } from "react-router-dom";
import CreateEventForm from "./CreateEventForm";
import { inject, observer } from "mobx-react";
import Events from "./Events";
import Calendar from "../Calendar/Calendar";
import api from "../../api/events";

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
      today: moment(new Date()),
      searchEvents: []
    };
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

  handleEdit = id => {
    this.props.history.push(`/events/edit/${id}`);
  };

  handleDelete = id => {
    this.props.eventsStore.deleteEvent(id);
  };

  handleSearch = ({ target: { value } }) => {
    if (value) {
      api.search(value).then(data => {
        this.setState({
          searchEvents: data
        });
      });
    } else {
      this.setState({
        searchEvents: []
      });
    }
  };

  // renders

  renderEvents() {
    const groups = this.props.eventsStore.groupedByDays;
    return (
      <div className="event-list">
        <Events
          groups={groups}
          onEdit={this.handleEdit}
          onDelete={this.handleDelete}
        />
        <div className="event-list__pagination">
          <Pagination
            showQuickJumperevents
            onChange={this.handleChangePagination}
            total={this.props.eventsStore.total}
            pageSize={10}
          />
        </div>
      </div>
    );
  }

  render() {
    const { isFormVisible } = this.state;
    const { avatar, userName } = this.props.currentUserStore;
    const { events } = this.props.eventsStore;

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
            {events.length > 0 && !isFormVisible ? (
              <>
                <div className="project-groups__search">
                  <Search
                    placeholder="Поиск по событиям"
                    onChange={this.handleSearch}
                  />
                  <ul className="search-results">
                    {this.state.searchEvents.map(event => {
                      return (
                        <li key={event.id}>
                          <Link to={`events/${event.id}`}>{event.title}</Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {this.renderEvents()}
              </>
            ) : (
              <div className="empty-text">Событий пока нет</div>
            )}
            {isFormVisible && (
              <CreateEventForm
                avatar={avatar}
                userName={userName}
                onCancel={this.handleCancel}
                onSuccess={this.handleCreateSuccess}
              />
            )}
          </Col>
          <Col span={8}>
            <div className="side-wrap">
              <div className="section-title">События</div>
              <Button
                type="primary"
                style={{ width: "100%", height: "52px" }}
                onClick={this.handleAddEvent}
              >
                Создать событие
              </Button>
            </div>

            <Calendar />
          </Col>
        </Row>
      </div>
    );
  }
}

export default EventList;
