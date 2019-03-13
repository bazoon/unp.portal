import React, { Component } from "react";
import PropTypes from "prop-types";
import { Tabs, Input } from "antd";
import { connect } from "react-redux";
import { Actions } from "jumpstate";
import ProjectGroup from "./ProjectGroup";
import "./ProjectGroups.less";

const { TabPane } = Tabs;
const { Search } = Input;

class ProjectGroups extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    groups: []
  };

  componentDidMount = () => {
    Actions.getProjectGroups(this.props.type);
  };

  renderGroups() {
    const { groups } = this.props;
    return groups.map(g => <ProjectGroup key={g.id} group={g} />);
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
          Управление
        </TabPane>
      </Tabs>
    );
  }
}

const mapStateToProps = state => {
  return { groups: state.projectGroups.groups };
};

export default connect(mapStateToProps)(ProjectGroups);
