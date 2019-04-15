import React, { Component } from "react";
import propTypes from "prop-types";

export class FlexItem extends Component {
  static propTypes = {
    flex: propTypes.number.isRequired,
    isFlexContainer: propTypes.bool
  };

  render() {
    const { children, flex, isFlexContainer } = this.props;
    const style = {
      flex
    };
    if (isFlexContainer) {
      style.display = "flex";
    }
    return <div style={style}>{children}</div>;
  }
}

export default FlexItem;
