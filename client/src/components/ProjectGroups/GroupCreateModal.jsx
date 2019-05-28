import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "antd";
import { Actions } from "jumpstate";
import GroupForm from "./GroupForm";

class GroupCreateModal extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  handleOk = () => {
    const form = this.formRef.current;
    const { userId } = this.props;
    const { onOk } = this.props;
    const formData = new FormData();

    form.validateFields((err, fields) => {
      let files = [];
      let docs = [];
      if (fields.files) {
        files = fields.files.fileList.map(f => f.originFileObj);
        delete fields.files;
      }

      if (fields.docs) {
        docs = fields.docs.fileList.map(f => f.originFileObj);
        delete fields.docs;
      }

      const keys = Object.keys(fields);
      keys.forEach(key => {
        if (fields[key]) {
          formData.append(key, fields[key]);
        }
      });

      formData.append("userId", userId);

      files.forEach(f => {
        formData.append("file", f);
      });

      docs.forEach(d => {
        formData.append("doc", d);
      });

      Actions.postCreateGroup({ payload: formData, userId });
    });
    this.onFormSubmit();
    onOk();
  };

  handleSubmit = onFormSubmit => {
    this.onFormSubmit = onFormSubmit;
  };

  render() {
    return (
      <Modal
        title="Создать событие"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.handleOk}
        width={600}
      >
        <GroupForm ref={this.formRef} onSubmit={this.handleSubmit} />
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(GroupCreateModal);
