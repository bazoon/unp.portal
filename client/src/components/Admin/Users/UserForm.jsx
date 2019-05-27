import React, { Component } from "react";
import { Actions } from "jumpstate";
import moment from "moment";
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
import PositionForm from "../Positions/PositionsForm";
import OrganizationForm from "../Organizations/OrganizationForm";

import EditWindow from "../../EditWindow/EditWindow";

const { Option } = Select;
const { TextArea } = Input;

class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.organizationColumns = [
      {
        title: "Наименование",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "",
        dataIndex: "edit",
        key: "edit",
        render: (text, record) => {
          return (
            <Icon
              type="edit"
              onClick={this.handleEditOrganization.bind(this, record)}
            />
          );
        }
      }
    ];

    this.positionColumns = [
      {
        title: "Наименование",
        dataIndex: "name",
        key: "name"
      },
      {
        title: "",
        dataIndex: "edit",
        key: "edit",
        render: (text, record) => {
          return (
            <Icon
              type="edit"
              onClick={this.handleEditPosition.bind(this, record)}
            />
          );
        }
      }
    ];

    this.state = {
      files: [],
      isEditingOrganization: false,
      organizationEditRecord: undefined,
      organizationId: undefined,
      isEditingPosition: false,
      positionId: undefined,
      positionEditRecord: undefined
    };
  }

  // Organization select
  handleAddOrganization = () => {
    this.setState({
      isEditingOrganization: true,
      organizationEditRecord: undefined
    });
  };

  handleEditOrganization = record => {
    this.setState({
      isEditingOrganization: true,
      organizationEditRecord: record
    });
  };

  handleCancelAddOrganization = () => {
    this.setState({
      isEditingOrganization: false
    });
  };

  handleSaveOrganization = fields => {
    if (fields.id) {
      Actions.editOrganization(fields);
    } else {
      Actions.createOrganization(fields);
    }

    this.setState({
      isEditingOrganization: false
    });
  };

  handleSelectOrganization = id => {
    this.setState({
      organizationId: id
    });
  };

  // Position select
  handleAddPosition = () => {
    this.setState({
      isEditingPosition: true,
      positionEditRecord: undefined
    });
  };

  handleEditPosition = record => {
    this.setState({
      isEditingPosition: true,
      positionEditRecord: record
    });
  };

  handleCancelAddPosition = () => {
    this.setState({
      isEditingPosition: false
    });
  };

  handleSavePosition = fields => {
    if (fields.id) {
      Actions.editPosition(fields);
    } else {
      Actions.createPosition(fields);
    }

    this.setState({
      isEditingPosition: false
    });
  };

  handleSelectPosition = id => {
    this.setState({
      positionId: id
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, login, avatar, isAdmin } = this.props.user || {};
    const positionId =
      this.state.positionId ||
      (this.props.user &&
        this.props.user.position &&
        this.props.user.position.id);

    const { isPaswordRequired } = this.props;
    const { organizations, positions } = this.props;
    const {
      isEditingOrganization,
      organizationEditRecord,
      isEditingPosition,
      positionEditRecord
    } = this.state;
    const organizationId =
      this.state.organizationId ||
      (this.props.user &&
        this.props.user.organization &&
        this.props.user.organization.id);

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
                    <EditWindow
                      title="Организации"
                      onSelect={this.handleSelectOrganization}
                      columns={this.organizationColumns}
                      dataSource={organizations}
                      onAdd={this.handleAddOrganization}
                      onEdit={this.handleEditOrganization}
                      isInEditMode={isEditingOrganization}
                      editForm={
                        <OrganizationForm
                          onOk={this.handleSaveOrganization}
                          onCancel={this.handleCancelAddOrganization}
                          visible={isEditingOrganization}
                          editRecord={organizationEditRecord}
                        />
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Должность">
                  {getFieldDecorator("positionId", {
                    rules: [{ required: true, message: "Должность" }],
                    initialValue: positionId
                  })(
                    <EditWindow
                      title="Должности"
                      onSelect={this.handleSelectPosition}
                      columns={this.positionColumns}
                      dataSource={positions}
                      onAdd={this.handleAddPosition}
                      onEdit={this.handleEditPosition}
                      isInEditMode={isEditingPosition}
                      editForm={
                        <PositionForm
                          onOk={this.handleSavePosition}
                          onCancel={this.handleCancelAddPosition}
                          visible={isEditingPosition}
                          editRecord={positionEditRecord}
                        />
                      }
                    />
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
