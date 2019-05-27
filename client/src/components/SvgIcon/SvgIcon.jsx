import React, { Component } from "react";

class SvgIcon extends Component {
  render() {
    return (
      <div
        className="svg-icon"
        {...this.props}
        dangerouslySetInnerHTML={{ __html: this.props.icon }}
      />
    );
  }
}

export default SvgIcon;
