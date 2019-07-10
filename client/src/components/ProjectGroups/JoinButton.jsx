import React from "react";
import { Button } from "antd";

export default props => {
  const { groupId } = props;
  return (
    <Button
      className="project-group__join-button"
      style={props.style}
      onClick={props.onClick}
    >
      Присоединиться
    </Button>
  );
};
