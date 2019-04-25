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

import { FlexRow } from "../../Form/FlexRow";
import { FlexItem } from "../../Form/FlexItem";
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

  handleSubmit = e => {};

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <FlexRow>
          {getFieldDecorator("title", {
            rules: [{ required: true, message: "Обсуждение" }]
          })(<Input placeholder="Обсуждение" />)}
        </FlexRow>
      </Form>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
