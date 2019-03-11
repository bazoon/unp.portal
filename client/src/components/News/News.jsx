import React, { Component } from "react";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import moment from "moment";
import "./News.less";

class News extends Component {
  static defaultProps = {
    news: []
  };

  componentDidMount = () => {
    Actions.getNews();
  };

  renderItem = item => {
    return (
      <div className="news__item" key={item.id}>
        <div className="news__avatar">
          <img src={item.avatar} alt="news avatar" />
        </div>
        <div className="news__info">
          <span className="news__title">{item.title}</span>
          <span className="news__date">
            {moment(item.date).format("DD.MM.YYYY")}
          </span>
        </div>
      </div>
    );
  };

  render() {
    const { news } = this.props;
    return (
      <div className="news">
        <div className="news__header">Новости</div>
        {news.map(item => this.renderItem(item))}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { news: state.News.news };
};

export default connect(mapStateToProps)(News);
