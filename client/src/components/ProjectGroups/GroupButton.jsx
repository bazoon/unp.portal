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
    const style = { width: "100%" };
    const canJoin = isOpen && state === 0;
    const canRequest = !isOpen && state === 0;
    const canLeave = state === 1;
    const isWaiting = state === 2;

    return (
      <div>
        {canJoin && <JoinButton style={style} onClick={onJoin} />}

        {canLeave && <LeaveButton style={style} onClick={onLeave} />}

        {canRequest && <RequestButton style={style} onClick={onRequest} />}

        {isWaiting && <WaitButton style={style} />}
      </div>
    );
  }
}

export default GroupButton;
