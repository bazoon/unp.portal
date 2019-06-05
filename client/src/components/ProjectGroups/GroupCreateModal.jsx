import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import { Modal, Steps, Button } from "antd";
import GroupForm from "./GroupForm";

const { Step } = Steps;
@inject("groupsStore")
@observer
class GroupCreateModal extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      currentStep: 0,
      docs: []
    };
  }

  handleOk = () => {
    const form = this.formRef.current;
    const { userId } = this.props;
    const { onOk } = this.props;
    const formData = new FormData();

    form.validateFields((err, fields) => {
      let docs = [];

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

      docs.forEach(d => {
        formData.append("doc", d);
      });

      this.props.groupsStore.createGroup(formData);
    });
    this.onFormSubmit();
    onOk();
  };

  handleSubmit = onFormSubmit => {
    this.onFormSubmit = onFormSubmit;
  };

  handleBack = () => {
    this.setState({
      currentStep: this.state.currentStep - 1
    });
  };

  handleNext = () => {
    const form = this.formRef.current;
    form.validateFields(err => {
      if (!err) {
        this.setState({
          currentStep: this.state.currentStep + 1
        });
      }
    });
  };

  handleCancel = () => {
    const form = this.formRef.current;
    form.resetFields();
    this.setState({
      docs: [],
      currentStep: 0
    });
    this.props.onCancel();
  };

  handleDocsChanged = docs => {
    this.setState({
      docs
    });
  };

  render() {
    const { currentStep } = this.state;
    const { backgrounds } = this.props.groupsStore;

    return (
      <Modal
        title="Создание группы"
        visible={this.props.visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        width={800}
        bodyStyle={{ minHeight: "400px" }}
        footer={
          <div>
            {currentStep === 2 && (
              <Button key="submit" type="primary" onClick={this.handleOk}>
                Создать
              </Button>
            )}
            {currentStep > 0 && (
              <Button key="back" onClick={this.handleBack}>
                Назад
              </Button>
            )}
            {currentStep < 2 && (
              <Button type="primary" key="next" onClick={this.handleNext}>
                Далее
              </Button>
            )}
          </div>
        }
      >
        <Steps size="small" current={currentStep}>
          <Step title="Шаг1" description="Название и описание" />
          <Step title="Шаг 2" description="Добавление файлов" />
          <Step title="Шаг 3" description="Фоновая картинка" />
        </Steps>
        <GroupForm
          backgrounds={backgrounds}
          step={currentStep}
          ref={this.formRef}
          onSubmit={this.handleSubmit}
          docs={this.state.docs}
          onDocsChanged={this.handleDocsChanged}
        />
      </Modal>
    );
  }
}

export default GroupCreateModal;
