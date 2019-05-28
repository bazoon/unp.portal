import React from "react";
import { Button } from "antd";
import { Actions } from "jumpstate";

export default props => {
  const { groupId } = props;
  return (
    <Button
      className="project-group__leave-button"
      style={props.style}
      onClick={props.onClick}
    >
      Покинуть группу
    </Button>
  );
};
