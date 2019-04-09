import React, { Component } from "react";
import { Form, Icon, Input } from "antd";

class LinksForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      link: "",
      title: ""
    };
  }

  handleInputKeyPress = e => {
    const { link, title } = this.state;
    const { onSubmit } = this.props;
    if (e.charCode === 13) {
      onSubmit({
        link,
        title
      }).then(() => {
        this.props.form.setFieldsValue({
          link: "",
          title: ""
        });
      });
    }
  };

  handleChangeLink = e => {
    this.setState({
      link: e.target.value
    });
  };

  handleChangeTitle = e => {
    this.setState({
      title: e.target.value
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { title, link } = this.state;

    return (
      <div className="links-form">
        <Form layout="vertical" onSubmit={this.handleSubmit}>
          <Form.Item>
            {getFieldDecorator("link", {
              rules: [{ required: true, message: "Ссылка" }]
            })(
              <Input
                prefix={
                  <Icon type="link" style={{ color: "rgba(0,0,0,.25)" }} />
                }
                placeholder="Ссылка"
                onKeyPress={this.handleInputKeyPress}
                onChange={this.handleChangeLink}
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("title", {
              rules: [{ required: true, message: "Описание" }]
            })(
              <Input
                type="text"
                placeholder="Описание"
                onKeyPress={this.handleInputKeyPress}
                onChange={this.handleChangeTitle}
              />
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: "links" })(LinksForm);

export default WrappedNormalLoginForm;
