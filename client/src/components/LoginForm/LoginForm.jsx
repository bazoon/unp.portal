import React, { Component } from "react";
import { connect } from "react-redux";
import { Form, Icon, Input, Button, Checkbox } from "antd";
import { Actions } from "jumpstate";
import cn from "classnames";
import "./loginForm.less";
import api from "../../api/api";
import { Tabs } from "antd";
const { TabPane } = Tabs;

export class LoginForm extends Component {
  handleSubmit = e => {
    e.preventDefault();
    const userName = this.props.form.getFieldValue("userName");
    const password = this.props.form.getFieldValue("password");
    Actions.login({ userName, password }).then(response => {
      this.props.onLogin();
    });
  };

  handleSignup = e => {
    e.preventDefault();
    const userName = this.props.form.getFieldValue("userName");
    const password = this.props.form.getFieldValue("password");
    Actions.signup({ userName, password }).then(response => {
      this.props.onLogin();
    });
  };

  componentDidUpdate = (prevProps, prevState) => {
    console.log(this.props);
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loginFailed } = this.props.login;
    const className = cn("login-form__wrap", {
      "login-form__wrap-failed": loginFailed
    });

    return (
      <div className="login-form__container">
        <div className={className}>
          <Tabs defaultActiveKey="login">
            <TabPane tab="Войти" key="login">
              <Form layout="vertical" onSubmit={this.handleSubmit}>
                <Form.Item key="username">
                  {getFieldDecorator("userName", {
                    rules: [{ required: true, message: "Логин" }]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      placeholder="Имя"
                    />
                  )}
                </Form.Item>

                <Form.Item key="password">
                  {getFieldDecorator("password", {
                    rules: [{ required: true, message: "Пароль" }]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      type="password"
                      placeholder="Пароль"
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator("remember", {
                    valuePropName: "checked",
                    initialValue: true
                  })(<Checkbox>Запомнить меня</Checkbox>)}
                </Form.Item>
                <Form.Item style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Войти
                  </Button>
                </Form.Item>
                {loginFailed && (
                  <div className="login-form__failed">
                    Неверный логин или пароль
                  </div>
                )}
              </Form>
            </TabPane>

            <TabPane tab="Зарегестрироваться" key="signup">
              <Form layout="vertical" onSubmit={this.handleSignup}>
                <Form.Item key="username">
                  {getFieldDecorator("userName", {
                    rules: [{ required: true, message: "Логин" }]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      placeholder="Имя"
                    />
                  )}
                </Form.Item>

                <Form.Item key="password">
                  {getFieldDecorator("password", {
                    rules: [{ required: true, message: "Пароль" }]
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: "rgba(0,0,0,.25)" }}
                        />
                      }
                      type="password"
                      placeholder="Пароль"
                    />
                  )}
                </Form.Item>
                <Form.Item>
                  {getFieldDecorator("remember", {
                    valuePropName: "checked",
                    initialValue: true
                  })(<Checkbox>Запомнить меня</Checkbox>)}
                </Form.Item>
                <Form.Item style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-form-button"
                  >
                    Войти
                  </Button>
                </Form.Item>
                {loginFailed && (
                  <div className="login-form__failed">
                    Неверный логин или пароль
                  </div>
                )}
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    );
  }
}

const WrappedNormalLoginForm = Form.create({ name: "normal_login" })(LoginForm);

const mapStateToProps = state => {
  return { login: state.Login };
};

export default connect(mapStateToProps)(WrappedNormalLoginForm);