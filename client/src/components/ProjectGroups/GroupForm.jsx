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
      files: []
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

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FlexRow>
          {getFieldDecorator("groupTitle", {
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
          {getFieldDecorator("groupDescription")(
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
      </Form>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
