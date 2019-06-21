import React, { Component } from "react";
import { connect } from "react-redux";
import EventModal from "../Events/EventModal";
import moment from "moment";
import { observer, inject } from "mobx-react";
import "./Calendar.less";
import cn from "classnames";
import Events from "../Events/Events";

import { Calendar, Button, Input, Icon, Popover } from "antd";

@inject("eventsStore")
@observer
class EventCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddModalVisible: false
    };
  }

  dateCellRender = d => {
    const day = d.get("date");
    const { events, currentDate } = this.props.eventsStore;
    const today = currentDate || new Date();
    const isSame = moment(d).isSame(today, "day");
    const className = cn("calendar-day", {
      "calendar-day_selected": isSame
    });

    let style = {};
    const eventsOnDay = events.filter(e => {
      const fromDate = moment(e.startDate);

      return (
        fromDate.get("year") === d.get("year") &&
        fromDate.get("date") === d.get("date") &&
        fromDate.get("month") === d.get("month")
      );
    });

    const eventsPopup = (
      <ul style={{ listStyleType: "none", padding: 0 }}>
        {eventsOnDay.map(e => (
          <li key={e.id}>{e.title}</li>
        ))}
      </ul>
    );

    if (eventsOnDay.length > 0) {
      style = { background: "#549069", textAlign: "center" };
    }

    return eventsOnDay.length > 0 ? (
      <Popover content={eventsPopup}>
        <div className={className}>
          {day}
          <div className="calendar-day__events">
            {eventsOnDay.map(event => {
              return <div key={event.id} className="calendar-day__event" />;
            })}
          </div>
        </div>
      </Popover>
    ) : (
      <div className={className}>{day}</div>
    );
  };

  handleAddEvent = () => {
    this.setState({
      isAddModalVisible: true
    });
  };

  handleCancel = () => {
    this.setState({
      isAddModalVisible: false
    });
  };

  handleOk = () => {
    this.setState({
      isAddModalVisible: false
    });
  };

  handleChange = date => {
    this.props.eventsStore.setCurrentDate(date.toDate());
  };

  render() {
    const l = this.props.eventsStore.events.length;
    return (
      <React.Fragment>
        <div className="feed__calendar">
          <Calendar
            // HACK: чтобы заставить календарь перерисоваться при получении
            // событий
            l={l}
            fullscreen={false}
            dateFullCellRender={this.dateCellRender}
            onChange={this.handleChange}
          />
        </div>
        <div className="feed__events">
          <Events groups={this.props.eventsStore.upcomingGroupedByDays} />
        </div>
        {/* <EventModal
          visible={this.state.isAddModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        /> */}
      </React.Fragment>
    );
  }
}

export default EventCalendar;
