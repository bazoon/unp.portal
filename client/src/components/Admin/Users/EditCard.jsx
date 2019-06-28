import React, { Component } from "react";
import UserForm from "./UserForm";
import { Button } from "antd/lib/radio";
import { Row, Col } from "antd";
import { observer, inject } from "mobx-react";

@inject("usersStore")
@inject("organizationsStore")
@inject("positionsStore")
@observer
class CreateCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        position: {},
        organization: {}
      }
    };
    this.formRef = React.createRef();
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    this.props.usersStore.get(id);
    this.props.organizationsStore.loadAll();
    this.props.positionsStore.loadAll();
  }

  handleSave = () => {
    const { id } = this.props.match.params;
    const form = this.formRef.current;
    const formData = new FormData();

    form.validateFields((err, fields) => {
      if (err) return;
      const keys = Object.keys(fields);
      const avatar = fields.avatar && fields.avatar.file;
      delete fields.avatar;

      keys.forEach(key => {
        if (fields[key]) {
          formData.append(key, fields[key]);
        }
      });

      if (avatar) {
        formData.append("avatar", avatar);
      }

      formData.append("id", id);
      this.props.usersStore.updateUser(formData);
    });
  };

  render() {
    return (
      <div>
        <Row>
          <Col span={16}>
            <div className="section-header">
              <div className="section-title">Личный кабинет</div>
            </div>
            <div className="user__edit-card">
              <UserForm
                ref={this.formRef}
                onSubmit={() => {}}
                avatar={this.props.avatar}
                organizations={this.props.organizations}
                positions={this.props.positions}
                user={this.props.usersStore.currentUser}
                onSave={this.handleSave}
              />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CreateCard;
