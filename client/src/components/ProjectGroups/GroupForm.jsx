import React, { Component } from "react";
import {
  Calendar,
  Modal,
  Button,
  Form,
  Checkbox,
  Input,
  Icon,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Select,
  Upload
} from "antd";

import { FlexRow } from "../Form/FlexRow";
import { FlexItem } from "../Form/FlexItem";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      docs: []
    };
  }

  componentDidMount() {
    this.props.onSubmit(this.handleSubmit);
  }

  handleSubmit = e => {
    this.props.form.resetFields();
    this.setState({
      files: []
    });
  };

  handleFilesChanged = info => {
    this.setState({
      files: info.fileList
    });
  };

  handleDocsChanged = info => {
    this.setState({
      docs: info.fileList
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FlexRow>
          {getFieldDecorator("title", {
            rules: [{ required: true, message: "Название группы" }]
          })(<Input placeholder="Название группы" />)}
        </FlexRow>

        <FlexRow>
          <FlexItem flex={1}>
            {getFieldDecorator("isOpen", {
              valuePropName: "checked",
              initialValue: true
            })(<Checkbox>Открытая группа</Checkbox>)}
          </FlexItem>
        </FlexRow>

        <FlexRow>
          {getFieldDecorator("description")(
            <TextArea placeholder="Описание группы" />
          )}
        </FlexRow>

        <FlexRow>
          {getFieldDecorator("files", {})(
            <Upload
              onChange={this.handleFilesChanged}
              fileList={this.state.files}
              beforeUpload={() => false}
            >
              <Button>
                <Icon type="upload" />
                Лого
              </Button>
            </Upload>
          )}
        </FlexRow>
        <FlexRow>
          {getFieldDecorator("docs", {})(
            <Upload
              onChange={this.handleDocsChanged}
              fileList={this.state.docs}
              beforeUpload={() => false}
              multiple
            >
              <Button>
                <Icon type="upload" />
                Файлы
              </Button>
            </Upload>
          )}
        </FlexRow>
      </Form>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
