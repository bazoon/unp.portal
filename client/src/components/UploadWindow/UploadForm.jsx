import React, { Component } from "react";
import {
  Form,
  Icon,
  Input,
  Button,
  Checkbox,
  Modal,
  Row,
  Col,
  Upload
} from "antd";
import { observer, inject } from "mobx-react";
import moment from "moment";
import "./UploadWindow.less";

@inject("currentUserStore")
@observer
class UploadForm extends Component {
  constructor(props) {
    super(props);
    this.state = { fileList: [] };
  }

  handleDocsChanged = value => {
    this.props.onChange(value.fileList);
  };

  handleFileNameChange = (e, doc, extension) => {
    const name = extension ? `${e.target.value}.${extension}` : e.target.value;
    doc.originFileObj = new File([doc.originFileObj], name);
    this.props.onChange(this.props.value.slice());
  };

  handleRemoveFile = doc => {
    const fileList = this.props.value;

    const newFileList = fileList.filter(f => {
      return f.name !== doc.name;
    });

    this.props.onChange(newFileList);
  };

  renderFileInputs = docs => {
    return docs.map(doc => {
      const periodIndex = doc.name.lastIndexOf(".");
      const name = doc.name.slice(0, periodIndex);
      const extension = periodIndex > 0 && doc.name.slice(periodIndex + 1);

      return (
        <div className="upload-form__inputs" key={doc.name}>
          <Input
            className="upload-form__input"
            onChange={e => this.handleFileNameChange(e, doc, extension)}
            defaultValue={name}
          />
          <div
            className="upload-form__input-remove"
            onClick={this.handleRemoveFile.bind(this, doc)}
          >
            x
          </div>
        </div>
      );
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { value } = this.props;

    const fileList = value || [];

    const formItemLayout = {
      labelCol: {
        span: 24
      },
      wrapperCol: {
        span: 24
      }
    };

    const today = moment().format("DD.MM.YYYY HH:MM");

    return (
      <Form onSubmit={this.handleSignup}>
        <Form.Item label="Дата" {...formItemLayout}>
          {getFieldDecorator("date", {
            initialValue: today
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item label="Автор" {...formItemLayout}>
          {getFieldDecorator("author", {
            initialValue: this.props.currentUserStore.userName
          })(<Input disabled />)}
        </Form.Item>
        <Form.Item>
          <Upload
            onChange={this.handleDocsChanged}
            fileList={fileList}
            beforeUpload={() => false}
            multiple
            showUploadList={false}
          >
            <Button>
              <Icon type="upload" />
              Загрузить
            </Button>
          </Upload>

          <Form.Item>{this.renderFileInputs(fileList)}</Form.Item>
        </Form.Item>
      </Form>
    );
  }
}

const WrappedUploadForm = Form.create({ name: "upload_form" })(UploadForm);
export default WrappedUploadForm;
