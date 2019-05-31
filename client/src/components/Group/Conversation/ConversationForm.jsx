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
import { Actions } from "jumpstate";

const { Option } = Select;
const { TextArea } = Input;

class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  handlePublish = () => {
    const { form, projectGroupId } = this.props;
    const formData = new FormData();

    form.validateFields((err, fields) => {
      if (err) return;
      let files = [];

      if (fields.files) {
        files = fields.files.fileList.map(f => f.originFileObj);
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

      Actions.postCreateConversation(formData).then(() => {
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

    return (
      <div className="group__conversation-form">
        <div className="group__conversation-form-user">
          <img src={this.props.avatar} />
          <div>{this.props.userName}</div>
        </div>
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <div className="form-row form-row_24">
            {getFieldDecorator("title", {
              rules: [{ required: true, message: "Наименование" }]
            })(<Input placeholder="Наименование" />)}
          </div>
          <div className="form-row form-row_32">
            {getFieldDecorator("description", {
              rules: [{ required: true, message: "Описание" }]
            })(<Input.TextArea rows={5} placeholder="Описание" />)}
          </div>
          <div className="form-row form-row_40">
            {getFieldDecorator("files", {})(
              <Upload
                onChange={this.handleDocsChanged}
                onPreview={this.handlePreview}
                fileList={this.state.files}
                beforeUpload={() => false}
                multiple
              >
                <Button>
                  <Icon type="upload" />
                  Загрузить
                </Button>
              </Upload>
            )}
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
