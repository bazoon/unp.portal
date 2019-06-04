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
      isMember,
      onLeave,
      onJoin,
      onRequest,
      participant
    } = this.props;

    console.log(this.props);

    const canJoin = (isOpen && !participant) || (isAdmin && !participant);
    const canRequest = !isOpen && !participant && isMember !== false;
    const canLeave = participant && isMember !== false;
    const isWaiting = !isOpen && isMember === false;

    return (
      <div>
        {canJoin && <JoinButton onClick={onJoin} />}

        {canLeave && <LeaveButton onClick={onLeave} />}

        {canRequest && <RequestButton onClick={onRequest} />}

        {isWaiting && <WaitButton />}
      </div>
    );
  }
}

export default GroupButton;
