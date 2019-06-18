import React, { Component } from "react";
import { connect } from "react-redux";
import EventModal from "../Events/EventModal";
import moment from "moment";
import { observer, inject } from "mobx-react";
import "./Calendar.less";

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
    const events = this.props.eventsStore.events;

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
        <div className="calendar-day">
          {day}
          <div className="calendar-day__events">
            {eventsOnDay.map(event => {
              return <div key={event.id} className="calendar-day__event" />;
            })}
          </div>
        </div>
      </Popover>
    ) : (
      <div className="calendar-day">{day}</div>
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

  render() {
    const l = this.props.eventsStore.events.length;
    return (
      <React.Fragment>
        <Calendar
          // HACK: чтобы заставить календарь перерисоваться при получении
          // событий
          l={l}
          fullscreen={false}
          dateFullCellRender={this.dateCellRender}
        />
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
