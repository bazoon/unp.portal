import React, { Component } from "react";
import { Table, Checkbox } from "antd";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import Preferences from "./reducer";

class UserProfilePreferences extends Component {
  constructor(props) {
    super(props);

    this.columns = [
      {
        title: "Наименование",
        dataIndex: "title",
        key: "title"
      },
      {
        title: "Тип",
        dataIndex: "type",
        key: "type"
      },
      {
        title: "SMS",
        dataIndex: "sms",
        key: "sms",
        render: (value, record, index) => {
          return (
            <Checkbox
              checked={value}
              onChange={e => this.handleCheckChange(e, record, "sms")}
            />
          );
        }
      },
      {
        title: "Push",
        dataIndex: "push",
        key: "push",
        render: (value, record, index) => {
          return (
            <Checkbox
              checked={value}
              onChange={e => this.handleCheckChange(e, record, "push")}
            />
          );
        }
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (value, record, index) => {
          return (
            <Checkbox
              checked={value}
              onChange={e => this.handleCheckChange(e, record, "email")}
            />
          );
        }
      }
    ];
  }

  componentDidMount = () => {
    Actions.getPreferences();
  };

  handleCheckChange = (e, record, type) => {
    const payload = { ...record, [type]: e.target.checked };
    Actions.savePreferences(payload);
  };

  render() {
    const { preferences } = this.props;
    return (
      <div className="user-profile__preferences">
        <Table dataSource={preferences} columns={this.columns} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { preferences: state.UserProfilePreferences.preferences };
};

export default connect(mapStateToProps)(UserProfilePreferences);
