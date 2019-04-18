import React, { Component } from "react";
import PropTypes from "prop-types";
import { Button, Tabs, Input } from "antd";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import { ProjectGroup } from "./ProjectGroup";
import "./ProjectGroups.less";
import GroupCreateModal from "./GroupCreateModal";

const { TabPane } = Tabs;
const { Search } = Input;

class ProjectGroups extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.object)
  };

  constructor(props) {
    super(props);
    this.state = {
      isCreateModalVisible: false
    };
  }

  static defaultProps = {
    groups: []
  };

  handleUnsubscribe = groupId => {
    const { userId } = this.props;
    Actions.postUnsubscribeProjectGroup({ groupId, userId });
  };

  handleSubscribe = groupId => {
    const { userId } = this.props;
    Actions.postSubscribeProjectGroup({ groupId, userId });
  };

  handleAddGroup = () => {
    this.setState({
      isCreateModalVisible: true
    });
  };

  handleCancel = () => {
    this.setState({
      isCreateModalVisible: false
    });
  };

  handleOk = () => {
    this.setState({
      isCreateModalVisible: false
    });
  };

  componentDidMount = () => {
    const { type, userId } = this.props;
    Actions.getProjectGroups({ type, userId });
  };

  renderGroups() {
    const { groups } = this.props;
    return groups.map(g => (
      <ProjectGroup
        onUnsubscribe={this.handleUnsubscribe}
        onSubscribe={this.handleSubscribe}
        key={g.id}
        group={g}
      />
    ));
  }

  render() {
    return (
      <>
        <div className="project-groups__title">Группы</div>
        <div className="project-groups__title-list">Список групп</div>
        <div className="project-groups-admin">
          <Button onClick={this.handleAddGroup}>Создать группу</Button>
        </div>
        <GroupCreateModal
          visible={this.state.isCreateModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          userId={this.props.userId}
        />
        <div className="project-groups">{this.renderGroups()}</div>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    groups: state.projectGroups.groups,
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(ProjectGroups);
