import React, { Component } from "react";
import { connect } from "react-redux";
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

class NewChannel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  componentDidMount() {
    Actions.getAllChannels();
  }

  filterUsers = (inputValue, option) => {
    const { children } = option.props;
    return children.includes(inputValue);
  };

  handleOk = () => {
    const { form } = this.props;
    const { userId } = this.props;

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
        title="Выберите канал"
      >
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <FlexRow>
            {getFieldDecorator("selectedUserId")(
              <Select
                showSearch={true}
                filterOption={this.filterUsers}
                placeholder="Выберите канал"
                onChange={this.handleChangeRemindBefore}
              >
                {this.props.allChannels.map(channel => {
                  return (
                    <Option key={channel.id} value={channel.id}>
                      <div style={{ display: "flex" }}>
                        <img
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            marginRight: "5px"
                          }}
                          src={`/uploads/${channel.avatar}`}
                        />
                        {channel.name}
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
    userId: state.Login.userId,
    allChannels: state.Chat.allChannels
  };
};

const WrappedNewChannel = Form.create({ name: "joinChannelForm" })(NewChannel);
export default connect(mapStateToProps)(WrappedNewChannel);
