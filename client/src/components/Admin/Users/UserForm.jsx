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
  Upload,
  Avatar,
  Select
} from "antd";

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

  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, login, avatar, isAdmin } = this.props.user || {};
    const positionId = this.props.user && this.props.user.position.id;
    const organizationId = this.props.user && this.props.user.organization.id;
    const { isPaswordRequired } = this.props;

    return (
      <Form layout="vertical">
        <Row type="flex" gutter={20}>
          <Col span={18}>
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item label="Логин">
                  {getFieldDecorator("login", {
                    rules: [{ required: true, message: "Логин" }],
                    initialValue: login
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Пароль">
                  {getFieldDecorator("password", {
                    rules: [{ required: isPaswordRequired, message: "Пароль" }]
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="ФИО">
                  {getFieldDecorator("name", {
                    rules: [{ required: true, message: "ФИО" }],
                    initialValue: name
                  })(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Организация">
                  {getFieldDecorator("organizationId", {
                    rules: [{ required: true, message: "Организация" }],
                    initialValue: organizationId,
                    valuePropName: "value"
                  })(
                    <Select>
                      {this.props.organizations.map(o => {
                        return (
                          <Option key={o.id} value={o.id}>
                            {o.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Должность">
                  {getFieldDecorator("positionId", {
                    rules: [{ required: true, message: "Должность" }],
                    initialValue: positionId
                  })(
                    <Select>
                      {this.props.positions.map(p => {
                        return (
                          <Option key={p.id} value={p.id}>
                            {p.name}
                          </Option>
                        );
                      })}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                {getFieldDecorator("isAdmin", {
                  valuePropName: "checked",
                  initialValue: isAdmin
                })(<Checkbox>Администратор?</Checkbox>)}
              </Col>
            </Row>
          </Col>

          <Col span={6}>
            <Row type="flex" justify="center">
              <Col span={12}>
                <Avatar size={128} icon="user" src={avatar} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
