import React, { Component } from "react";
import { observer, inject } from "mobx-react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Button,
  Tabs,
  Input,
  Icon,
  Breadcrumb,
  Row,
  Col,
  Pagination
} from "antd";
import ProjectGroup from "./ProjectGroup";
import "./ProjectGroups.less";
import GroupCreateModal from "./GroupCreateModal";

const { TabPane } = Tabs;
const { Search } = Input;

@inject("groupsStore")
@observer
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
    this.props.groupsStore.unsubscribe(groupId);
  };

  handleSubscribe = groupId => {
    this.props.groupsStore.subscribe(groupId);
  };

  handleRequest = groupId => {
    this.props.groupsStore.request(groupId);
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
    this.props.groupsStore.loadGroups({ page: 1, pageSize: 10 });
    window.g = this.props.groupsStore;
  };

  handleChangePagination = (page, pageSize) => {
    this.props.groupsStore.setPage(page);
    this.props.groupsStore.loadGroups();
  };

  renderGroups(groups) {
    return groups.map(g => (
      <ProjectGroup
        onUnsubscribe={this.handleUnsubscribe}
        onSubscribe={this.handleSubscribe}
        onRequest={this.handleRequest}
        key={g.id}
        group={g}
      />
    ));
  }

  render() {
    const { page, pageSize } = this.props.groupsStore;
    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Группы</Breadcrumb.Item>
        </Breadcrumb>

        <GroupCreateModal
          visible={this.state.isCreateModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          userId={this.props.userId}
        />
        <Row gutter={27}>
          <Col span={16}>
            <div className="project-groups__search">
              <Search placeholder="Поиск по группам" />
            </div>
            <div className="project-groups">
              {this.renderGroups(this.props.groupsStore.groups)}
            </div>
            <Pagination
              showQuickJumper
              onChange={this.handleChangePagination}
              total={this.props.groupsStore.total}
              pageSize={10}
            />
          </Col>
          <Col span={8}>
            <div className="project-groups__side-wrap">
              <div className="project-groups__side-title">
                Группы обсуждений
              </div>
              <div className="project-groups__side-text">
                Все обсуждения сгруппированы по темам, если вы не нашли группу с
                интересующим вас обсуждением – можете создать новую группу.
              </div>
              <Button
                type="primary"
                style={{ width: "100%", height: "52px" }}
                onClick={this.handleAddGroup}
              >
                Создать новую группу
              </Button>
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

export default ProjectGroups;
