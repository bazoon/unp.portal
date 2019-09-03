import React, { Component } from "react";
import { Form, Icon, Input, Button, Checkbox, Modal, Row, Col } from "antd";
import cn from "classnames";
import "./loginForm.less";
import api from "../../api/api";
import { observer, inject } from "mobx-react";

@observer
@inject("currentUserStore")
class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggingIn: true,
      unpUrl: "",
      bpUrl: ""
    };
  }

  componentDidMount() {
    api.get("settings", {}, true).then(({ data }) => {
      this.setState({
        unpUrl: data.unpUrl,
        bpUrl: data.bpUrl
      });
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((errors, fields) => {
      if (!errors) {
        this.props.currentUserStore.login(fields).then(error => {
          if (!error) {
            this.props.onLogin();
            form.resetFields();
          } else {
            this.props.onLogin();
          }
        });
      }
    });
  };

  handleSignup = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((errors, fields) => {
      if (!errors) {
        this.props.currentUserStore.signup(fields).then(() => {
          this.props.onLogin();
          form.resetFields();
          this.setState({
            isLoggingIn: true
          });
        });
      }
    });
  };

  handleToggle = e => {
    e.preventDefault();
    this.setState({
      isLoggingIn: !this.state.isLoggingIn
    });
  };

  renderSignup() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    };

    return (
      <Form onSubmit={this.handleSignup}>
        <Form.Item label="Фамилия" {...formItemLayout}>
          {getFieldDecorator("surName", {
            rules: [
              {
                required: true,
                message: "Пожалуйста укажите фамилию"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Имя" {...formItemLayout}>
          {getFieldDecorator("firstName", {
            rules: [
              {
                required: true,
                message: "Пожалуйста укажите имя"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Отчество" {...formItemLayout}>
          {getFieldDecorator("lastName", {
            rules: [
              {
                required: true,
                message: "Пожалуйста укажите отчество"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="E-mail" {...formItemLayout}>
          {getFieldDecorator("email", {
            rules: [
              {
                type: "email",
                message: "Это не почта!"
              },
              {
                required: true,
                message: "Пожалуйста укажите электронную почту"
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Password" {...formItemLayout}>
          {getFieldDecorator("password", {
            rules: [
              {
                required: true,
                message: "Введите пароль"
              },
              {
                validator: this.validateToNextPassword
              }
            ]
          })(<Input.Password />)}
        </Form.Item>
        <Form.Item label="Confirm Password" {...formItemLayout}>
          {getFieldDecorator("confirm", {
            rules: [
              {
                required: true,
                message: "Подтвердите пароль"
              },
              {
                validator: this.compareToFirstPassword
              }
            ]
          })(<Input.Password onBlur={this.handleConfirmBlur} />)}
        </Form.Item>
        <Form.Item label={<span>Логин</span>} {...formItemLayout}>
          {getFieldDecorator("login", {
            rules: [
              {
                required: true,
                message: "Укажите логин",
                whitespace: true
              }
            ]
          })(<Input />)}
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form__button"
          >
            Зарегистрироваться
          </Button>
          <Form.Item>
            или{" "}
            <a onClick={this.handleToggle} href="#">
              войдите
            </a>
          </Form.Item>
        </Form.Item>
      </Form>
    );
  }

  renderLogin(loginError) {
    const { getFieldDecorator } = this.props.form;
    const { unpUrl, bpUrl } = this.state;

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit}>
        <Form.Item key="username" className="login-form__input">
          {getFieldDecorator("userName", {
            rules: [{ required: true, message: "Логин" }]
          })(
            <Input
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Имя"
            />
          )}
        </Form.Item>

        <Form.Item key="password" className="login-form__input">
          {getFieldDecorator("password", {
            rules: [{ required: true, message: "Пароль" }]
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder="Пароль"
            />
          )}
        </Form.Item>
        <Form.Item className="login-form__input_small">
          {getFieldDecorator("remember", {
            valuePropName: "checked",
            initialValue: true
          })(
            <Row gutter={8} type="flex" justify="space-between">
              <Col span={12}>
                {getFieldDecorator("rememberme")(
                  <Checkbox>Запомнить меня</Checkbox>
                )}
              </Col>
              <Col
                span={12}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <a href="#">Забыли пароль?</a>
              </Col>
            </Row>
          )}
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form__button"
          >
            Войти
          </Button>
          <Form.Item>
            Войти через:{" "}
            &nbsp;или&nbsp;
            <a className="signup-link" href={unpUrl}>
              Управление национальными проектами
            </a>
          </Form.Item>
        </Form.Item>
        {loginError && <div className="login-form__failed">{loginError}</div>}
      </Form>
    );
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loginError } = this.props.currentUserStore;
    const { isLoggingIn } = this.state;

    return (
      <Modal
        title="Вход на портал"
        visible={!this.props.isLoggedIn}
        footer={null}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        className="login-form"
        closable={false}
        width={800}
      >
        {isLoggingIn ? this.renderLogin(loginError) : this.renderSignup()}
      </Modal>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: "normal_login" })(LoginForm);
export default WrappedNormalLoginForm;
