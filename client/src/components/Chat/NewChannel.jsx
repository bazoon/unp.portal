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
import moment from "moment";
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

  handleFilesChanged = info => {
    this.setState({
      files: info.fileList
    });
  };

  handleOk = () => {
    const { form } = this.props;
    const formData = new FormData();
    const userId = this.props.currentUserStore.id;

    formData.append("userId", userId);

    form.validateFields((err, fields) => {
      let files = [];
      if (fields.files) {
        files = fields.files.fileList.map(f => f.originFileObj);
        delete fields.files;
      }

      const keys = Object.keys(fields);
      keys.forEach(key => {
        if (fields[key]) {
          formData.append(key, fields[key]);
        }
      });

      files.forEach(f => {
        formData.append("file", f);
      });

      this.props.onOk(formData).then(() => {
        form.resetFields();
        this.setState({
          files: []
        });
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
        title="Создать канал"
      >
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <FlexRow>
            {getFieldDecorator("channelTitle", {})(
              <Input placeholder="Название канала" />
            )}
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
                  Лого
                </Button>
              </Upload>
            )}
          </FlexRow>
        </Form>
      </Modal>
    );
  }
}

const WrappedNewChannel = Form.create({ name: "newChannelForm" })(NewChannel);
export default WrappedNewChannel;
