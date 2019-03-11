import React, { Component } from "react";
import { Calendar } from "antd";
import News from "../News/News";

export class RightMenu extends Component {
  dateCellRender = d => {
    const day = d.get("date");
    let style = {};

    switch (true) {
      case day % 5 === 0:
        style = { background: "#549069", textAlign: "center" };
        break;
      case day % 7 === 0:
        style = { background: "#E39394", textAlign: "center" };
        break;
    }

    return <div style={style}>{day}</div>;
  };

  render() {
    return (
      <React.Fragment>
        <Calendar fullscreen={false} dateFullCellRender={this.dateCellRender} />
        <News />
      </React.Fragment>
    );
  }
}

export default RightMenu;
