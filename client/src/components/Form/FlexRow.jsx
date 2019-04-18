import React, { Component } from "react";

export class FlexRow extends Component {
  render() {
    const { children } = this.props;
    const { flex } = this.props;

    return (
      <div className="flex-container__row flex-container flex-container_between flex-container_gutter-5">
        {children}
      </div>
    );
  }
}

export default FlexRow;
