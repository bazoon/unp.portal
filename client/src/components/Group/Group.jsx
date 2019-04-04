import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button } from "antd";
import "./Group.less";
import { Actions } from "jumpstate";

class Group extends Component {
  static defaultProps = {
    group: {}
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    Actions.getProjectGroup(id);
  }

  renderIsOpen(isOpen) {
    return isOpen ? "Открытая группа" : "Закрытая группа";
  }

  renderConversations(conversations = []) {
    const { id } = this.props.match.params;
    return (
      <div className="group__discussions-container">
        <div className="group__title_small">Обсуждения</div>
        <div className="group__discussions">
          {conversations.map(conversation => {
            const link = `${id}/conversation/${conversation.id}`;
            return (
              <div className="group__discusstion" key={conversation.id}>
                <div className="group__discussion-title">
                  <Link to={link}>{conversation.title}</Link>
                </div>
                <div className="group__discussion-info">
                  <div className="group__text_small">6 комментариев &nbsp;</div>
                  <div className="group__text_small">Последний &nbsp;</div>
                  <div className="group__text_small">
                    Петров Петр 28.08.2019
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    const { title, avatar, isOpen, conversations } = this.props.group[0] || {};

    return (
      <div className="group">
        <div className="group__info-container">
          <div className="group__avatar">
            <img
              src="https://kazved.ru/uploadimg/105264_185148_forum_2017_1_1391.jpg"
              alt="Лого проекта"
            />
          </div>
          <div className="group__info">
            <div className="group__text">{this.renderIsOpen(isOpen)}</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div className="group__title">{title}</div>
              <Button size="small" disabled>
                Вы участник
              </Button>
            </div>
            <hr />
            <div className="group__text">О группе</div>
            <div className="group__text_small">
              Группа содержит информацию и обсуждения, относящиеся к реализации
              программ национальных проектов в 2019 году. Культура, Образование,
              Экология и п.р.
            </div>
          </div>
        </div>
        {this.renderConversations(conversations)}
        <div className="groups__feed" />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    group: state.ProjectGroup.group,
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(Group);
