import React from "react";
import { Button } from "antd";
import { Actions } from "jumpstate";

export default props => {
  return (
    <Button
      disabled
      className="project-group__leave-button"
      style={props.style}
    >
      На рассмотрении
    </Button>
  );
};
