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
      <Tabs defaultActiveKey="0">
        <TabPane tab="Группы" key="0">
          <div className="project-groups__search">
            <Search />
          </div>
          <div className="project-groups">{this.renderGroups()}</div>
        </TabPane>
        <TabPane tab="Управление" key="1">
          <div className="project-groups-admin">
            <Button>Создать группу</Button>
            <GroupCreateModal
              visible={this.state.isAddModalVisible}
              onCancel={this.handleCancel}
              onOk={this.handleOk}
            />
          </div>
        </TabPane>
      </Tabs>
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
