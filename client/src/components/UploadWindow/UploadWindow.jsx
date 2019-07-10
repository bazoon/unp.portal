import React, { Component } from "react";
import { Button } from "antd";
import UploadForm from "./UploadForm";
import { Modal } from "antd";

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
        showCloseIcon={false}
        width={800}
      >
        <>
          <UploadForm value={value} onChange={this.props.onChange} />
        </>
      </Modal>
    );
  }
}

export default UploadWindow;
