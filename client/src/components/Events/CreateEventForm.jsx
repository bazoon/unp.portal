import React, { Component } from "react";
import {
  Calendar,
  Modal,
  Button,
  Form,
  Checkbox,
  Input,
  Icon,
  Select,
  Upload,
  Row,
  Col,
  DatePicker
} from "antd";

import moment from "moment";
import groupsApi from "../../api/projectGroups";
import usersApi from "../../api/users";
import { observer, inject } from "mobx-react";
import UploadWindow from "../UploadWindow/UploadWindow";
import RenderFiles from "../ProjectGroups/RenderFiles";

const { Option } = Select;

@inject("eventsStore")
@observer
class CreateEventForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      groups: [],
      users: [],
      accessType: 0,
      isUploadVisible: false
    };
  }

  componentDidMount() {
    groupsApi.getUserGroups().then(groups => {
      this.setState({
        groups
      });
    });
    usersApi.loadAll().then(data => {
      this.setState({
        users: data
      });
    });
  }

  handlePublish = () => {
    const { form } = this.props;
    const formData = new FormData();

    form.validateFields((err, fields) => {
      if (err) return;
      let files = [];

      if (fields.files) {
        files = fields.files.map(f => f.originFileObj);
        delete fields.files;
      }

      if (fields.date) {
        fields.date = fields.date.toISOString();
      }

      const keys = Object.keys(fields);

      keys.forEach(key => {
        if (fields[key]) {
          formData.append(key, fields[key]);
        }
      });

      files.forEach(file => {
        formData.append("file", file);
      });

      this.props.eventsStore.create(formData).then(() => {
        this.props.onSuccess();
      });
    });
  };

  handleCancel = () => {
    this.props.form.resetFields();
    this.props.onCancel();
  };

  handleDocsChanged = info => {
    this.setState({
      files: info.fileList
    });
  };

  handleChangeAccessType = accessType => {
    this.setState({
      accessType
    });
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

  // renders

  renderSelectGroups() {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        {getFieldDecorator("accessEntitiesIds", {
          valuePropName: "value"
        })(
          <Select
            mode="multiple"
            optionFilterProp="title"
            showSearch
            placeholder="Поиск группам"
          >
            {this.state.groups.map(group => (
              <Option key={group.id} value={group.id} title={group.title}>
                {group.title}
              </Option>
            ))}
          </Select>
        )}
      </>
    );
  }

  renderSelectUsers() {
    const { getFieldDecorator } = this.props.form;
    return (
      <>
        {getFieldDecorator("accessEntitiesIds", {
          valuePropName: "value"
        })(
          <Select
            mode="multiple"
            optionFilterProp="title"
            showSearch
            placeholder="Поиск по пользователям"
          >
            {this.state.users.map(user => (
              <Option key={user.id} value={user.id} title={user.name}>
                {user.name}
              </Option>
            ))}
          </Select>
        )}
      </>
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { isUploadVisible } = this.state;

    return (
      <div className="group__conversation-form">
        <div className="group__conversation-form-user">
          <img src={this.props.avatar} />
          <div>{this.props.userName}</div>
        </div>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <div className="form-row form-row_24">
            <Form.Item>
              {getFieldDecorator("title", {
                rules: [{ required: true, message: "Наименование" }]
              })(<Input placeholder="Наименование" autoFocus />)}
            </Form.Item>
          </div>
          <div className="form-row form-row_32">
            <Form.Item>
              {getFieldDecorator("description", {
                rules: [{ required: true, message: "Описание" }]
              })(<Input.TextArea rows={5} placeholder="Описание" />)}
            </Form.Item>
          </div>
          <div className="form-row form-row_40">
            {getFieldDecorator("files", {})(
              <UploadWindow
                visible={isUploadVisible}
                onCancel={this.handleHideUpload}
                onOk={this.handleHideUpload}
              />
            )}
            <Button onClick={this.handleToggleUpload}>
              <Icon type="upload" />
              Загрузить
            </Button>
            {getFieldDecorator("files")(<RenderFiles />)}
          </div>

          <div className="form-row form-row_24">
            <Form.Item
              label="Дата и время"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
              {getFieldDecorator("date", { initialValue: moment() })(
                <DatePicker format="DD.MM.YYYY HH:mm" placeholder="" showTime />
              )}
            </Form.Item>
          </div>

          <div className="form-row form-row_24">
            <Form.Item
              label="Напоминание"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
              {getFieldDecorator("remind", {
                valuePropName: "value"
              })(
                <Select>
                  <Option value={60}>За час</Option>
                  <Option value={60 * 24}>День</Option>
                  <Option value={60 * 24 * 30}>Месяц</Option>
                </Select>
              )}
            </Form.Item>
          </div>

          <div className="form-row form-row_24">
            <Form.Item
              label="Доступ"
              labelCol={{ span: 5 }}
              wrapperCol={{ span: 12 }}
            >
              {getFieldDecorator("accessType", {
                initialValue: 0
              })(
                <Select onChange={this.handleChangeAccessType}>
                  <Option value={0}>Никто</Option>
                  <Option value={1}>Точечный выбор</Option>
                  <Option value={2}>Группы</Option>
                </Select>
              )}
            </Form.Item>
          </div>

          {this.state.accessType !== 0 && (
            <div className="form-row form-row_24">
              <Form.Item>
                <Row>
                  <Col span={12} offset={5}>
                    {getFieldDecorator("date", {
                      valuePropName: "value"
                    })(
                      this.state.accessType === 1
                        ? this.renderSelectUsers()
                        : this.renderSelectGroups()
                    )}
                  </Col>
                  <Col offset={2} span={5}>
                    <Button type="primary">Найти</Button>
                  </Col>
                </Row>
              </Form.Item>
            </div>
          )}
          <Row>
            <Col span={24}>
              <Button
                type="primary"
                style={{ marginRight: "8px" }}
                onClick={this.handlePublish}
              >
                Опубликовать
              </Button>
              <Button onClick={this.handleCancel}>Отмена</Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

const WrappedCreateEventForm = Form.create({ name: "CreateEventForm" })(
  CreateEventForm
);
export default WrappedCreateEventForm;
