import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import "./Group.less";

export class Group extends Component {
  render() {
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
            <div className="group__text">Открытая группа</div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div className="group__title">Национальные проекты</div>
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
        <div className="group__discussions-container">
          <div className="group__title_small">Обсуждения</div>
          <div className="group__discussions">
            <div className="group__discusstion">
              <div className="group__discussion-title">
                <Link to="project">Национальный проект "Культура"</Link>
              </div>
              <div className="group__discussion-info">
                <div className="group__text_small">6 комментариев &nbsp;</div>
                <div className="group__text_small">Последний &nbsp;</div>
                <div className="group__text_small">Петров Петр 28.08.2019</div>
              </div>
            </div>
            <hr />
            <div className="group__discusstion">
              <div className="group__discussion-title">
                <Link to="project">Национальный проект "Образование"</Link>
              </div>
              <div className="group__discussion-info">
                <div className="group__text_small">17 комментариев &nbsp;</div>
                <div className="group__text_small">Последний &nbsp;</div>
                <div className="group__text_small">Петров Петр 28.08.2019</div>
              </div>
            </div>
            <hr />
            <div className="group__discusstion">
              <div className="group__discussion-title">
                <Link to="project">Национальный проект "Экология"</Link>
              </div>
              <div className="group__discussion-info">
                <div className="group__text_small">9 комментариев &nbsp;</div>
                <div className="group__text_small">Последний &nbsp;</div>
                <div className="group__text_small">Петров Петр 28.08.2019</div>
              </div>
            </div>
            <hr />
          </div>
        </div>
        <div className="groups__feed" />
      </div>
    );
  }
}

export default Group;
