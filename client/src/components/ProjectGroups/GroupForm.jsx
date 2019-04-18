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
          {getFieldDecorator("eventTitle", {
            rules: [{ required: true, message: "Название события" }]
          })(<Input placeholder="Название события" />)}
        </FlexRow>

        <FlexRow>
          {getFieldDecorator("fromDate", { initialValue: moment() })(
            <DatePicker format="DD.MM.YYYY HH:mm" placeholder="" showTime />
          )}

          <div style={{ textAlign: "center" }}>―</div>

          {getFieldDecorator("toDate", { initialValue: moment() })(
            <DatePicker format="DD.MM.YYYY HH:mm" placeholder="" showTime />
          )}
        </FlexRow>

        <FlexRow>
          <FlexItem flex={1}>
            {getFieldDecorator("allDay", {})(<Checkbox>Весь день</Checkbox>)}
          </FlexItem>

          <FlexItem flex={2} isFlexContainer>
            <label style={{ minWidth: "100px" }}>Напомнить за</label>
            {getFieldDecorator("remindBefore", { initialValue: 15 })(
              <Select onChange={this.handleChangeRemindBefore}>
                <Option value="15">15 минут</Option>
                <Option value="30">30 минут</Option>
                <Option value="45">45 минут</Option>
                <Option value="60">60 минут</Option>
              </Select>
            )}
          </FlexItem>
        </FlexRow>

        <FlexRow>
          {getFieldDecorator("place", {
            rules: [{ required: true, message: "Место проведения" }]
          })(<Input placeholder="Место проведения" />)}
        </FlexRow>
        <FlexRow>
          {getFieldDecorator("description", {
            rules: [{ required: true, message: "Место проведения" }]
          })(<Input.TextArea placeholder="Описание" />)}
        </FlexRow>
        <FlexRow>
          {getFieldDecorator("files", {})(
            <Upload
              onChange={this.handleFilesChanged}
              multiple
              fileList={this.state.files}
              beforeUpload={() => false}
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
