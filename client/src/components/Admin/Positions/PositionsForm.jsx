import React, { Component } from "react";
import moment from "moment";
import { Button, Form, Input, Modal } from "antd";

class PositionForm extends Component {
  handleOk = () => {
    const { editRecord } = this.props;
    const { form } = this.props;
    const { onOk } = this.props;
    form.validateFields((err, fields) => {
      onOk(fields);
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, onCancel, editRecord } = this.props;
    const { id, name, inn } = editRecord || {};

    return (
      <Modal
        title="Организация"
        visible={visible}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <Form layout="vertical">
          {getFieldDecorator("id", {
            initialValue: id
          })(<Input disabled />)}
          <Form.Item label="Наименование">
            {getFieldDecorator("name", {
              rules: [{ required: true, message: "Наименование" }],
              initialValue: name
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "PositionForm" })(PositionForm);
export default WrappedGroupForm;
