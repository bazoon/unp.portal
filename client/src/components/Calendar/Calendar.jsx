import React, { Component } from "react";
import { connect } from "react-redux";
import EventModal from "../Events/EventModal";
import moment from "moment";
import "./Calendar.less";

import { Calendar, Button, Input, Icon, Popover } from "antd";

class EventCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAddModalVisible: false
    };
  }

  dateCellRender = d => {
    const day = d.get("date");
    const { events } = this.props;
    let style = {};

    const eventsOnDay = events.filter(e => {
      const fromDate = moment(e.fromDate);

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

    // return (
    //   eventsOnDay.length > 0 ? (
    //   <Popover content={eventsPopup}>
    //     <div className="calendar-day">
    //     {day}
    //     <div className="calendar-day__events">
    //       {eventsOnDay.map(() => {
    //         return <div className="calendar-day__event" />;
    //       })}
    //     </div>
    //   </div>
    //   </Popover>
    // ) : (
    //   <div className="calendar-day">
    //     {day}
    //   </div>
    // )
    // );
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
    return (
      <React.Fragment>
        <Button icon="plus" onClick={this.handleAddEvent} />
        <Calendar fullscreen={false} dateFullCellRender={this.dateCellRender} />
        <EventModal
          visible={this.state.isAddModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    events: state.Events.allEvents
  };
};

export default connect(mapStateToProps)(EventCalendar);
