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
  Col
} from "antd";

import moment from "moment";
import { observer, inject } from "mobx-react";
import { Actions } from "jumpstate";
import UploadWindow from "../../UploadWindow/UploadWindow";
import RenderFiles from "../../ProjectGroups/RenderFiles";

const { Option } = Select;
const { TextArea } = Input;

@inject("groupsStore")
@observer
class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isUploadVisible: false
    };
  }

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

  handlePublish = () => {
    const { form, projectGroupId } = this.props;
    const formData = new FormData();

    form.validateFields((err, fields) => {
      if (err) return;
      let files = [];

      if (fields.files) {
        files = fields.files.map(f => f.originFileObj);
        delete fields.files;
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

      formData.append("projectGroupId", projectGroupId);

      this.props.groupsStore.createConversation(formData).then(() => {
        this.props.onOk();
        this.handleCancel();
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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { isUploadVisible } = this.state;

    return (
      <div className="group__conversation-form">
        <div className="group__conversation-form-user">
          <img src={this.props.avatar} />
          <div>{this.props.userName}</div>
        </div>
        <Form layout="vertical" onSubmit={this.handleSubmit}>
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
              />
            )}
            <Button
              style={{ marginBottom: "32px" }}
              onClick={this.handleToggleUpload}
            >
              Загрузить
            </Button>
            {getFieldDecorator("files")(<RenderFiles />)}
          </div>
          <div className="form-row form-row_24">
            {getFieldDecorator("isNews", {
              valuePropName: "checked",
              initialValue: false
            })(<Checkbox>Выделить как новость</Checkbox>)}
          </div>

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

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
