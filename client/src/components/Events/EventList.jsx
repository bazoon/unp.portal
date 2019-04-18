import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import "./Events.less";
import moment from "moment";
import { Icon, Button } from "antd";
import prettyBytes from "pretty-bytes";
import getFileIcon from "../../utils/getFileIcon";

class EventList extends Component {
  static defaultProps = {
    events: []
  };

  constructor(props) {
    super(props);
    this.state = {
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
    Actions.getEvents({ userId, today });
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

  render() {
    const { today } = this.state;
    const currentDate = today.format("LL");
    const events = this.getTodayEvents();
    return (
      <div className="event-list">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <div className="event-list__header">События</div>
            <div className="event-list__date">{currentDate}</div>
          </div>
          <div>
            <Icon type="backward" onClick={this.handleBackward} />
            <Icon type="forward" onClick={this.handleForward} />
          </div>
        </div>
        {events.map(this.renderEvent)}
        {events.length == 0 && (
          <div className="event-list__no-events">Нет событий на этот день</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    events: state.Events.allEvents
  };
};

export default connect(mapStateToProps)(EventList);
