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
  message,
  Popconfirm,
  Checkbox
} from "antd";
import "./Documents.less";
import moment from "moment";
import prettyBytes from "pretty-bytes";
import { observer, inject } from "mobx-react";
import { isAlive } from "mobx-state-tree";
import ShareIcon from "../../../images/share";
import UploadWindow from "../UploadWindow/UploadWindow";
import RenderFiles from "../ProjectGroups/RenderFiles";
import api from "../../api/docs";

const { Search } = Input;

@inject("documentsStore")
@observer
class Documents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: [],
      isUploadVisible: false,
      columns: [
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
          title: "Описание",
          dataIndex: "description",
          key: "description"
        },
        {
          title: "Автор",
          dataIndex: "author",
          key: "author"
        },
        {
          title: "Прделиться",
          dataIndex: "share",
          key: "share",
          fixed: "right",
          render: (value, record) => {
            return (
              <a download href={record.url}>
                <ShareIcon />
              </a>
            );
          }
        },
        {
          title: "Удалить",
          dataIndex: "delete",
          key: "delete",
          fixed: "right",
          render: (value, record) => {
            if (!record.canDelete) return null;
            return (
              <Popconfirm
                title="Удалить файл?"
                onConfirm={() => this.handleDelete(record.id)}
              >
                <Icon type="delete" />
              </Popconfirm>
            );
          }
        }
      ]
    };
  }

  renderExpandedRow = (description, author) => {
    return (
      <div>
        <div>{description}</div>
        <div>Автор: {author}</div>
      </div>
    );
  };

  handleDelete = id => {
    this.props.documentsStore.deleteFile(id);
  };

  handleToggleUpload = () => {
    this.setState({
      isUploadVisible: true
    });
  };

  handleHideUpload = () => {
    this.setState({
      isUploadVisible: false
    });
  };

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

  handleDocsChanged = fileList => {
    this.setState({
      docs: fileList
    });
  };

  handleSearch = ({ target: { value } }) => {
    this.props.documentsStore.search(value);
  };

  // renders

  renderDocs(documents) {
    return (
      <Table
        showHeader={false}
        rowKey="id"
        dataSource={documents.slice()}
        columns={this.state.columns}
        scroll={{ x: 1300 }}
        // expandedRowRender={record => {
        //   if (!isAlive(record)) return null;
        //   return this.renderExpandedRow(record.description, record.author);
        // }}
        pagination={{
          showQuickJumper: true
        }}
      />
    );
  }

  componentDidMount() {
    this.props.documentsStore.loadAll();
  }

  renderColumnMenu = () => {
    return (
      <>
        <div>
          <Checkbox
            checked={this.state.checked}
            disabled={this.state.disabled}
            onChange={this.onChange}
          >
            Имя
          </Checkbox>
        </div>
        <div>
          <Checkbox
            checked={this.state.checked}
            disabled={this.state.disabled}
            onChange={this.onChange}
          >
            Размер
          </Checkbox>
        </div>
      </>
    );
  };

  render() {
    const { isUploadVisible } = this.state;
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
              <Search
                placeholder="Поиск по файлам"
                onChange={this.handleSearch}
              />
            </div>
            <div className="documents">
              {this.renderDocs(this.props.documentsStore.documents)}
            </div>
          </Col>
          <Col span={8}>
            <div className="side-wrap">
              <div className="section-title">Файлы</div>
              <div className="documents__side-text" />

              <UploadWindow
                visible={isUploadVisible}
                onOk={this.handleHideUpload}
                onCancel={this.handleHideUpload}
                onChange={this.handleDocsChanged}
                value={this.state.docs}
              />

              <Button
                type="primary"
                style={{ width: "100%", height: "52px" }}
                onClick={this.handleToggleUpload}
              >
                Загрузить
              </Button>
              <RenderFiles value={this.state.docs} />

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
