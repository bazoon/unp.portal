import React, { Component } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Button,
  Tabs,
  Input,
  Icon,
  Upload,
  Breadcrumb,
  Row,
  Col,
  Table,
  message
} from "antd";
import "./Documents.less";
import { Actions } from "jumpstate";
import { connect } from "react-redux";
import moment from "moment";
import prettyBytes from "pretty-bytes";
import { observer, inject } from "mobx-react";
import ShareIcon from "../../../images/share";

const { Search } = Input;

const columns = [
  {
    title: "Наименование",
    dataIndex: "name",
    key: "title"
  },
  {
    title: "",
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
  },
  {
    title: "Прделиться",
    dataIndex: "share",
    key: "share",
    render: (value, record) => {
      return (
        <ShareIcon
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigator.clipboard
              .writeText(`${location.origin}${record.url}`)
              .then(() => {
                message.success("Скопировано");
              })
          }
        />
      );
    }
  }
];

@inject("documentsStore")
@observer
class Documents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: []
    };
  }

  handleSubmit = (file, fileList) => {
    const formData = new FormData();
    const files = this.state.docs.map(f => f.originFileObj);
    files.forEach(file => {
      formData.append("file", file);
    });

    return this.props.documentsStore.upload(formData).then(() => {
      this.setState({
        docs: []
      });
      message.success("Файлы успешно загружены");
    });
  };

  handleDocsChanged = info => {
    this.setState({
      docs: info.fileList
    });
  };

  renderDocs(documents) {
    return (
      <Table
        showHeader={false}
        rowKey="id"
        dataSource={documents.slice()}
        columns={columns}
        pagination={{
          showQuickJumper: true
        }}
      />
    );
  }

  componentDidMount() {
    this.props.documentsStore.loadAll();
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
            <div className="documents">
              {this.renderDocs(this.props.documentsStore.getAll())}
            </div>
          </Col>
          <Col span={8}>
            <div className="documents__side-wrap">
              <div className="documents__side-title">Файлы</div>
              <div className="documents__side-text" />

              <Upload
                onChange={this.handleDocsChanged}
                multiple
                fileList={this.state.docs}
                beforeUpload={() => false}
              >
                <Button
                  type="primary"
                  style={{ width: "100%", height: "52px" }}
                  onClick={this.handleUploadFiles}
                >
                  Загрузить
                </Button>
              </Upload>
              {this.state.docs.length > 0 && (
                <Button
                  type="primary"
                  onClick={this.handleSubmit}
                  style={{ width: "100%", height: "52px" }}
                >
                  Сохранить
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default Documents;
