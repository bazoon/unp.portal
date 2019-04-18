import React, { Component } from "react";
import { Icon, Button } from "antd";

class DocsForm extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      uploadFiles: []
    };
  }

  renderFileForm = () => {
    return (
      <form ref={this.formRef} style={{ display: "none" }}>
        <input
          multiple
          type="file"
          name="file"
          onChange={this.handleFileChange}
        />
      </form>
    );
  };

  handleFileChange = e => {
    const files = Array.prototype.map.call(e.target.files, f => f);
    this.setState({
      uploadFiles: files
    });
  };

  handleFileSelect = () => {
    const form = this.formRef.current;
    const input = form.querySelector("input[type=file]");
    input.click();
  };

  handleFileUpload = () => {
    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit(this.state.uploadFiles).then(() => {
        this.setState({
          uploadFiles: []
        });
      });
    }
  };

  render() {
    const { uploadFiles } = this.state;
    return (
      <div>
        <Button onClick={this.handleFileSelect}>Выбрать файлы</Button>
        <Button onClick={this.handleFileUpload}>Сохранить</Button>
        {this.renderFileForm()}
        <ul>
          {uploadFiles.map(f => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default DocsForm;
