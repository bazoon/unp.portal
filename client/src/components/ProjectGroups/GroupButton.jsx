import React, { Component } from "react";
import JoinButton from "./JoinButton";
import LeaveButton from "./LeaveButton";
import RequestButton from "./RequestButton";
import WaitButton from "./WaitButton";

class GroupButton extends Component {
  render() {
    const {
      isOpen,
      isAdmin,
      state,
      onLeave,
      onJoin,
      onRequest,
      participant
    } = this.props;
    const style = {};
    const canJoin = isOpen && state === 0;
    const canRequest = !isOpen && state === 0;
    const canLeave = state === 1;
    const isWaiting = state === 2;
    const isDeclined = state === 3;

    return (
      <div>
        {canJoin && <JoinButton style={style} onClick={onJoin} />}

        {canLeave && <LeaveButton style={style} onClick={onLeave} />}

        {canRequest && <RequestButton style={style} onClick={onRequest} />}

        {isWaiting && <WaitButton style={style}>На рассмотрении</WaitButton>}
        {isDeclined && <WaitButton style={style}>Отказано</WaitButton>}
      </div>
    );
  }
}

export default GroupButton;
