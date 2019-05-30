import React, { Component } from "react";
import { connect } from "react-redux";
import { Modal, Steps, Button } from "antd";
import { Actions } from "jumpstate";
import GroupForm from "./GroupForm";

const { Step } = Steps;

class GroupCreateModal extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
    this.state = {
      currentStep: 0
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

      Actions.postCreateGroup({ payload: formData, userId });
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
    this.setState({
      currentStep: this.state.currentStep + 1
    });
  };

  render() {
    const { currentStep } = this.state;
    const { backgrounds } = this.props;

    return (
      <Modal
        title="Создание группы"
        visible={this.props.visible}
        onCancel={this.props.onCancel}
        onOk={this.handleOk}
        width={800}
        bodyStyle={{ minHeight: "400px" }}
        footer={[
          currentStep > 0 && (
            <Button key="back" onClick={this.handleBack}>
              Назад
            </Button>
          ),
          currentStep < 2 && (
            <Button key="next" onClick={this.handleNext}>
              Вперед
            </Button>
          ),
          currentStep === 2 && (
            <Button key="submit" type="primary" onClick={this.handleOk}>
              Создать
            </Button>
          )
        ]}
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
        />
      </Modal>
    );
  }
}

const mapStateToProps = state => {
  return {
    userId: state.Login.userId,
    backgrounds: state.projectGroups.backgrounds
  };
};

export default connect(mapStateToProps)(GroupCreateModal);
