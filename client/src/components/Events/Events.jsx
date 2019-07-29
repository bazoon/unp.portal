import React, { Component } from "react";
import moment from "moment";
import { pluralizeParticipants } from "../../utils/pluralize";
import MoreIcon from "../../../images/more";
import { Popover } from "antd";
import { Link } from "react-router-dom";
import { Observer } from "mobx-react";

class Events extends Component {
  renderOperationsMenu(event) {
    return (
      <>
        <div
          className="admin-user__menu-item"
          onClick={() => this.props.onEdit(event.id)}
        >
          Редактировать
        </div>
        <div
          className="admin-user__menu-item"
          onClick={() => this.props.onDelete(event.id)}
        >
          Удалить
        </div>
      </>
    );
  }

  renderEvents(groups) {
    const days = Object.keys(groups);

    return (
      <>
        {days.map(day => {
          const events = groups[day];
          return (
            <div key={day} className="event__day">
              <div className="event__day-header">{day}</div>
              <div className="event__day-items">
                {events.map(event => {
                  const time = moment(event.startDate).format("HH:mm");
                  return (
                    <div key={event.id} className="event__day-item">
                      <div>
                        <div className="event__day-time">{time}</div>
                        <div>
                          <div className="event__day-title">
                            <Link to={`/events/${event.id}`}>
                              {event.title}
                            </Link>
                          </div>
                          <div className="event__day-users-count">
                            <b>Участники:</b>
                            <ul>
                              {event.participants.map(p => (
                                <li key={p.id}>{p.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <Observer>
                        {() =>
                          event.canEdit && (
                            <Popover
                              placement="bottom"
                              content={this.renderOperationsMenu(event)}
                              trigger="click"
                            >
                              <MoreIcon style={{ cursor: "pointer" }} />
                            </Popover>
                          )
                        }
                      </Observer>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </>
    );
  }

  render() {
    return this.renderEvents(this.props.groups);
  }
}

export default Events;
