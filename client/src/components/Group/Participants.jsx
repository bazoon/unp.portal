import React, { Component } from "react";

class Participants extends Component {
  renderParticipants(participants) {
    const firstThree = participants.slice(0, 3);
    const restFive = participants.slice(3, 8);
    const rest = participants.slice(8);

    if (participants.length === 0) {
      return null;
    }

    return (
      <div className="group__participants-wrap">
        <div className="group__participants-main">
          {firstThree.map(participant => {
            return (
              <div key={participant.id} className="group__participant-info">
                <div className="group__participant-avatar">
                  <img src={participant.avatar} alt="avatar" />
                </div>
                <div className="group__participant-description">
                  <div className="group__participant-role">
                    {participant.roleName}
                  </div>
                  <div className="group__participant-name">
                    {participant.name}
                  </div>
                  <div className="group__participant-position">
                    {participant.position}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="group__participants-rest">
            {restFive.map(participant => {
              return (
                <div className="group__participant-avatar group__participant-avatar_row">
                  <img src={participant.avatar} alt="avatar" />
                </div>
              );
            })}
            {rest.length > 0 && (
              <div className="group__participants-more">
                И еще {rest.length}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return this.renderParticipants(this.props.participants);
  }
}

export default Participants;
