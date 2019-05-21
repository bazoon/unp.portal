import React, { Component } from "react";
import UserForm from "./UserForm";
import { connect } from "react-redux";
import { Button } from "antd/lib/radio";
import { Actions } from "jumpstate";

class CreateCard extends Component {
  constructor(props) {
    super(props);
    this.formRef = React.createRef();
  }

  componentDidMount() {
    Actions.getOrganizations();
    Actions.getPositions();
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

const mapStateToProps = state => {
  return {
    avatar: state.Login.avatar,
    organizations: state.Admin.organizations,
    positions: state.Admin.positions
  };
};

export default connect(mapStateToProps)(CreateCard);
