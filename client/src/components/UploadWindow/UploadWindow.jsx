import React, { Component } from "react";
import { Modal } from "antd";
import UploadForm from "./UploadForm";

class UploadWindow extends Component {
  constructor(props) {
    super(props);
  }

  handleCancel = () => {
    this.props.onChange([]);
    this.props.onCancel();
  };

  render() {
    const { value } = this.props;

    return (
      <Modal
        title="Загрузка файлов"
        visible={this.props.visible}
        onOk={this.props.onOk}
        onCancel={this.handleCancel}
        className="upload-form"
        width={800}
      >
        <UploadForm value={value} onChange={this.props.onChange} />
      </Modal>
    );
  }
}

export default UploadWindow;
