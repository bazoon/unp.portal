import React, { Component } from "react";
import { Table } from "antd";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import moment from "moment";
import "./Laws.less";

const columns = [
  {
    title: "Наименование",
    dataIndex: "title",
    key: "title"
  },
  {
    title: "Тип",
    dataIndex: "type",
    key: "type"
  },
  {
    title: "Отправитель",
    dataIndex: "sender",
    key: "sender"
  },
  {
    title: "Размер",
    dataIndex: "size",
    key: "size"
  }
];

class Laws extends Component {
  static defaultProps = {
    laws: []
  };

  componentDidMount = () => {
    Actions.getLaws();
  };

  render() {
    const { laws } = this.props;
    return (
      <div className="laws">
        <Table dataSource={laws} columns={columns} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { laws: state.Laws.laws };
};

export default connect(mapStateToProps)(Laws);
