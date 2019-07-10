import React, { Component } from "react";
import { Button } from "antd/lib/radio";
import UserForm from "./UserForm";

class CreateCard extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  handleSave = () => {
    const form = this.formRef.current;
    form.validateFields((err, fields) => {
      if (!err) {
        Actions.createUser(fields).then(() => {
          this.props.history.push("/admin/users");
        });
      }
    });
  };

  render() {
    return (
      <div>
        <div className="section-header">
          <div className="section-title">Пользователи</div>
          <Button onClick={this.handleSave}>Сохранить</Button>
        </div>
        <UserForm
          ref={this.formRef}
          onSubmit={() => {}}
          avatar={this.props.avatar}
          organizations={this.props.organizations}
          positions={this.props.positions}
          isPaswordRequired
        />
      </div>
    );
  }
}

export default CreateCard;
