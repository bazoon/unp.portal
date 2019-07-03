import React, { Component } from "react";
import { Button } from "antd";
import UploadForm from "./UploadForm";
// Используется сторонний компонент из-за
//  https://github.com/ant-design/ant-design/issues/16680
import Modal from "react-responsive-modal";

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
        open={this.props.visible}
        onOk={this.props.onOk}
        closeOnOverlayClick
        onClose={this.handleCancel}
        className="upload-form"
        showCloseIcon={false}
        // width={800}
      >
        <>
          <div className="ant-modal-header">
            <div className="ant-modal-title">Загрузка файлов</div>
          </div>
          <div className="ant-modal-body" style={{ width: "700px" }}>
            <UploadForm value={value} onChange={this.props.onChange} />
          </div>
          <div className="ant-modal-footer">
            <Button onClick={this.handleCancel}>Отмена</Button>
            <Button
              type="primary"
              style={{ marginLeft: "8px" }}
              onClick={this.props.onOk}
            >
              Ok
            </Button>
          </div>
        </>
      </Modal>
    );
  }
}

export default UploadWindow;
