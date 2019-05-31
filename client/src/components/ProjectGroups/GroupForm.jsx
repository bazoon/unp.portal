import React, { Component } from "react";
import {
  Calendar,
  Modal,
  Button,
  Form,
  Checkbox,
  Input,
  Icon,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Select,
  Upload,
  Radio
} from "antd";

import moment from "moment";
import { Actions } from "jumpstate";
import ChooseIcon from "../../../images/success";

const { Option } = Select;
const { TextArea } = Input;

class GroupForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      docs: []
    };
  }

  componentDidMount() {
    Actions.getProjectGroupsBackgrounds();
    this.props.onSubmit(this.handleSubmit);
  }

  handleSubmit = e => {
    this.props.form.resetFields();
  };

  handleDocsChanged = info => {
    this.props.onDocsChanged(info.fileList);
  };

  renderStep1(step) {
    const { getFieldDecorator } = this.props.form;
    const style = step !== 0 ? { display: "none" } : { display: "block" };

    return (
      <div style={style}>
        <Row>
          <Col span={24}>
            <Form.Item>
              {getFieldDecorator("title", {
                rules: [
                  { required: true, message: "Название группы" },
                  { max: 150, message: "Не больше 150 символов" }
                ]
              })(<Input placeholder="Название группы" />)}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            {getFieldDecorator("isOpen", {
              valuePropName: "checked",
              initialValue: true
            })(<Checkbox>Открытая группа</Checkbox>)}
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item>
              {getFieldDecorator("shortDescription", {
                rules: [{ max: 400, message: "Не больше 400 символов" }]
              })(<TextArea rows={3} placeholder="Краткое описание группы" />)}
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item>
              {getFieldDecorator("description", {
                rules: [{ max: 1000, message: "Не больше 1000 символов" }]
              })(<TextArea rows={3} placeholder="Описание группы" />)}
            </Form.Item>
          </Col>
        </Row>
      </div>
    );
  }

  renderStep2(step) {
    const { getFieldDecorator } = this.props.form;
    const style = step !== 1 ? { display: "none" } : { display: "block" };

    return (
      <div style={style}>
        <Row>
          <Col span={24}>
            {getFieldDecorator("docs", {})(
              <Upload
                listType="picture"
                onChange={this.handleDocsChanged}
                fileList={this.props.docs}
                beforeUpload={() => false}
                multiple
              >
                <Button>
                  <Icon type="upload" />
                  Загрузить
                </Button>
              </Upload>
            )}
          </Col>
        </Row>
      </div>
    );
  }

  renderStep3(step) {
    const { getFieldDecorator } = this.props.form;
    const { backgrounds } = this.props;
    const style = step !== 2 ? { display: "none" } : { display: "block" };

    return (
      <div style={style}>
        <Row>
          <Col span={24}>
            {getFieldDecorator("backgroundId", {})(
              <Radio.Group>
                {backgrounds.map(b => {
                  return (
                    <Radio value={b.id} key={b.id}>
                      <div className="project-groups__form-background-wrap">
                        <img
                          className="project-groups__form-background"
                          src={b.background}
                          key={b.id}
                        />
                        <ChooseIcon />
                      </div>
                    </Radio>
                  );
                })}
              </Radio.Group>
            )}
          </Col>
        </Row>
      </div>
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { step } = this.props;

    return (
      <div className="project-groups__form">
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          {this.renderStep1(step)}
          {this.renderStep2(step)}
          {this.renderStep3(step)}
        </Form>
      </div>
    );
  }
}

const WrappedGroupForm = Form.create({ name: "GroupForm" })(GroupForm);
export default WrappedGroupForm;
