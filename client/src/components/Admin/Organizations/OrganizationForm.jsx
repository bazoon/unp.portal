import React, { Component } from "react";
import moment from "moment";
import { Button, Form, Input, Modal } from "antd";

class OrganizationForm extends Component {
  handleOk = () => {
    const { editRecord } = this.props;
    const { form } = this.props;
    const { onOk } = this.props;
    form.validateFields((err, fields) => {
      if (editRecord) {
        onOk(fields, true);
      } else {
        onOk(fields);
      }
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
          <Form.Item label="ИНН">
            {getFieldDecorator("inn", {
              initialValue: inn
            })(<Input />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "OrganizationForm" })(
  OrganizationForm
);
export default WrappedGroupForm;
