import React, { Component } from "react";
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
import { observer, inject } from "mobx-react";
import EditWindow from "../../EditWindow/EditWindow";
import getImageUrlFromFile from "../../../utils/getImageUrlFromFile";
import { Observer } from "mobx-react";
import { Link } from "react-router-dom";

const { Option } = Select;
const { TextArea } = Input;

@inject("usersStore")
@inject("organizationsStore")
@inject("positionsStore")
@inject("currentUserStore")
@observer
class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.organizationColumns = [
      {
        title: "Наименование",
        dataIndex: "name",
        key: "name",
        // HACK: оборачиваем рендер в Observer чтобы отслеживать изменения внутри таблицы
        render: (text, record) => <Observer>{() => record.name}</Observer>
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
        key: "name",
        render: (text, record) => <Observer>{() => record.name}</Observer>
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
      avatarFile: [],
      isEditingOrganization: false,
      organizationEditRecord: undefined,
      organizationId: undefined,
      isEditingPosition: false,
      positionId: undefined,
      positionEditRecord: undefined,
      avatarUrl: undefined
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
      this.props.organizationsStore.update(fields);
    } else {
      this.props.organizationsStore.create(fields);
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
      this.props.positionsStore.update(fields);
    } else {
      this.props.positionsStore.create(fields);
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

  handleChangeAvatar = info => {
    getImageUrlFromFile(info.file).then(({ imageUrl }) => {
      this.setState({
        avatarUrl: imageUrl,
        avatarFile: info.fileList
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { usersStore } = this.props;
    const user = usersStore.currentUser || {};

    const positionId =
      this.state.positionId ||
      (this.props.user &&
        this.props.user.position &&
        this.props.user.position.id);

    const { isPaswordRequired } = this.props;
    const { organizations, positions } = this.props;

    const isEditingHimself = this.props.currentUserStore.id == user.id;
    const canEdit = this.props.currentUserStore.isAdmin || isEditingHimself;

    const {
      isEditingOrganization,
      organizationEditRecord,
      isEditingPosition,
      positionEditRecord,
      avatarUrl,
      avatarFile
    } = this.state;

    const organizationId =
      this.state.organizationId ||
      (this.props.user &&
        this.props.user.organization &&
        this.props.user.organization.id);

    const formItemLayout = {
      labelCol: {
        span: 5
      },
      wrapperCol: {
        span: 19
      }
    };

    const tailFormItemLayout = {
      wrapperCol: {
        span: 19,
        offset: 5
      }
    };

    return (
      <Form layout="horizontal" className="user__edit-form">
        <Row>
          <Form.Item
            style={{ display: "flex", alignItems: "center" }}
            label="Аватар"
            {...formItemLayout}
          >
            {getFieldDecorator("avatar", {})(
              <Upload
                fileList={avatarFile}
                multiple={false}
                showUploadList={false}
                beforeUpload={() => false}
                onChange={this.handleChangeAvatar}
              >
                {(user.avatar || avatarUrl) && (
                  <img
                    className="user__edit-form-avatar"
                    src={avatarUrl || user.avatar}
                  />
                )}
                <Button>Заменить</Button>
              </Upload>
            )}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Фамилия" {...formItemLayout}>
            {getFieldDecorator("surName", {
              rules: [{ required: true, message: "Фамилия" }],
              initialValue: usersStore.surName
            })(<Input />)}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Имя" {...formItemLayout}>
            {getFieldDecorator("firstName", {
              rules: [{ required: true, message: "Имя" }],
              initialValue: usersStore.firstName
            })(<Input />)}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Отчество" {...formItemLayout}>
            {getFieldDecorator("lastName", {
              rules: [{ required: true, message: "Отчество" }],
              initialValue: usersStore.lastName
            })(<Input />)}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Организация" {...formItemLayout}>
            {getFieldDecorator("organizationId", {
              rules: [{ required: true, message: "Организация" }],
              initialValue: organizationId,
              valuePropName: "value"
            })(
              <EditWindow
                title="Организации"
                onSelect={this.handleSelectOrganization}
                columns={this.organizationColumns}
                dataSource={this.props.organizationsStore.items.slice()}
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
        </Row>
        <Row>
          <Form.Item label="Должность" {...formItemLayout}>
            {getFieldDecorator("positionId", {
              rules: [{ required: true, message: "Должность" }],
              initialValue: positionId
            })(
              <EditWindow
                title="Должности"
                onSelect={this.handleSelectPosition}
                columns={this.positionColumns}
                dataSource={this.props.positionsStore.items.slice()}
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
        </Row>
        <Row>
          <Form.Item label="Логин" {...formItemLayout}>
            {getFieldDecorator("login", {
              rules: [{ required: true, message: "Логин" }],
              initialValue: user.login
            })(<Input />)}
          </Form.Item>
        </Row>
        <Row>
          <Form.Item label="Пароль" {...formItemLayout}>
            {getFieldDecorator("password", {})(<Input />)}
          </Form.Item>
        </Row>

        <Row>
          <Form.Item label="Администратор" {...formItemLayout}>
            {getFieldDecorator("isAdmin", {
              valuePropName: "checked",
              initialValue: user.isAdmin
            })(<Checkbox disabled={!this.props.currentUserStore.isAdmin} />)}
          </Form.Item>
        </Row>

        <Row>
          <Form.Item {...tailFormItemLayout}>
            <Button
              onClick={this.props.onSave}
              style={{ marginRight: "8px" }}
              type="primary"
              disabled={!canEdit}
            >
              Сохранить
            </Button>

            <Link to="/admin/users">
              <Button>Отмена</Button>
            </Link>
          </Form.Item>
        </Row>
      </Form>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
