import React, { Component } from "react";
import { connect } from "react-redux";
import { observer, inject } from "mobx-react";
import {
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Upload,
  Button,
  Icon
} from "antd";
import { FlexRow } from "../Form/FlexRow";
import { FlexItem } from "../Form/FlexItem";
import { Actions } from "jumpstate";
const { Option } = Select;

@inject("currentUserStore")
@observer
class NewChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  componentDidMount() {
    Actions.getAllUsers();
  }

  filterUsers = (inputValue, option) => {
    const { children } = option.props;
    return children.includes(inputValue);
  };

  handleOk = () => {
    const { form } = this.props;
    const userId = this.props.currentUserStore.id;

    form.validateFields((err, fields) => {
      const payload = { ...fields, userId };

      this.props.onOk(payload).then(() => {
        form.resetFields();
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Modal
        visible={this.props.isOpen}
        onCancel={this.props.onCancel}
        onOk={this.handleOk}
        title="Чат с пользователем"
      >
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <FlexRow>
            {getFieldDecorator("selectedUserId")(
              <Select
                showSearch={true}
                filterOption={this.filterUsers}
                placeholder="Выберите пользователя"
                onChange={this.handleChangeRemindBefore}
              >
                {this.props.users.map(user => {
                  return (
                    <Option key={user.id} value={user.id}>
                      <div style={{ display: "flex" }}>
                        <img
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            marginRight: "5px"
                          }}
                          src={user.avatar}
                        />
                        {user.name}
                      </div>
                    </Option>
                  );
                })}
              </Select>
            )}
          </FlexRow>
        </Form>
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    users: state.Users.users
  };
};

const WrappedNewChannel = Form.create({ name: "newChannelForm" })(NewChannel);
export default connect(mapStateToProps)(WrappedNewChannel);
