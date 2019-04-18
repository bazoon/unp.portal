import React, { Component } from "react";

export class Menu extends Component {
  handleUnsubscribe = () => {
    const { onUnsubscribe } = this.props;
    onUnsubscribe && onUnsubscribe();
  };

  render() {
    return (
      <div className="project-group__menu">
        <span>Уведомлять о записях</span>
        <hr />
        <span onClick={this.handleUnsubscribe}>Отписаться</span>
      </div>
    );
  }
}

export default Menu;
