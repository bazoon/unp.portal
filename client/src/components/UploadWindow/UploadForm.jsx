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

  componentDidMount() {
    console.log("CDM");
  }

  handleDocsChanged = value => {
    this.props.onChange(value.fileList);
  };

  handleFileNameChange = (e, doc) => {
    doc.originFileObj = new File([doc.originFileObj], e.target.value);
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
      return (
        <div className="upload-form__inputs" key={doc.name}>
          <Input
            className="upload-form__input"
            onChange={e => this.handleFileNameChange(e, doc)}
            defaultValue={doc.name}
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
