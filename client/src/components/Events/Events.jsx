import React, { Component } from "react";
import moment from "moment";
import { pluralizeParticipants } from "../../utils/pluralize";

class Events extends Component {
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
                      <div className="event__day-time">{time}</div>
                      <div>
                        <div className="event__day-title">{event.title}</div>
                        <div className="event__day-users-count">
                          {pluralizeParticipants(event.usersCount)}
                        </div>
                      </div>
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
