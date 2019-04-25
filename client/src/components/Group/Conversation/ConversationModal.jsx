import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "antd";
import { Actions } from "jumpstate";
import ConversationForm from "./ConversationForm";

class ConversationModal extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  handleOk = () => {
    const form = this.formRef.current;
    const { projectGroupId } = this.props;
    const { onOk } = this.props;

    form.validateFields((err, fields) => {
      Actions.postCreateConversation({ ...fields, projectGroupId }).then(() => {
        this.onFormSubmit();
        onOk();
      });
    });
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
        <ConversationForm ref={this.formRef} onSubmit={this.handleSubmit} />
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(ConversationModal);
