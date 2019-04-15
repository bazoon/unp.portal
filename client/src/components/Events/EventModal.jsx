import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal } from "antd";
import { Actions } from "jumpstate";
import EventForm from "./EventForm";

class EventModal extends Component {
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
      formData.append("userId", userId);

      files.forEach(f => {
        formData.append("file", f);
      });
      Actions.postCreateEvent({ payload: formData, userId });
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
        <EventForm ref={this.formRef} onSubmit={this.handleSubmit} />
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(EventModal);
