import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Button, Tabs, Input, Icon, Breadcrumb, Row, Col, Table } from "antd";
import "./Documents.less";
import { Actions } from "jumpstate";
import { connect } from "react-redux";
import moment from "moment";
import prettyBytes from "pretty-bytes";

const { Search } = Input;

const columns = [
  {
    title: "Наименование",
    dataIndex: "name",
    key: "title"
  },
  {
    title: "Тип",
    dataIndex: "createdAt",
    key: "type",
    render: value => {
      return moment(value).format("D MMMM YYYY HH:mm");
    }
  },
  {
    title: "Размер",
    dataIndex: "size",
    key: "size",
    render: value => {
      return value && prettyBytes(value, { locale: "ru" });
    }
  }
];

class Documents extends Component {
  renderDocs() {
    return (
      <Table rowKey="id" dataSource={this.props.files} columns={columns} />
    );
  }

  componentDidMount() {
    Actions.getDocuments();
  }

  render() {
    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Документы</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={27}>
          <Col span={16}>
            <div className="documents__search">
              <Search placeholder="Поиск по файлам" />
            </div>
            <div className="documents">{this.renderDocs()}</div>
          </Col>
          <Col span={8}>
            <div className="documents__side-wrap">
              <div className="documents__side-title">Файлы</div>
              <div className="documents__side-text">
                Все обсуждения сгруппированы по темам, если вы не нашли группу с
                интересующим вас обсуждением – можете создать новую группу.
              </div>
              <Button
                type="primary"
                style={{ width: "100%", height: "52px" }}
                onClick={this.handleUploadFiles}
              >
                Загрузить
              </Button>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}
const mapStateToProps = state => {
  return { files: state.Documents.files };
};

export default connect(mapStateToProps)(Documents);
