import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { Button, Layout, Icon, Collapse } from "antd";
import "./Group.less";
import { Actions } from "jumpstate";
import { pluralizeComments } from "../../utils/pluralize";
import moment from "moment";
import ConversationModal from "./Conversation/ConversationModal";

const Panel = Collapse.Panel;

const { Sider } = Layout;

class Group extends Component {
  static defaultProps = {
    group: {},
    conversations: []
  };

  constructor(props) {
    super(props);
    this.state = {
      isConversationModalVisible: false
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    const { userId } = this.props;
    Actions.getProjectGroup({ id, userId });
  }

  handleUnsubscribe = () => {
    const { userId } = this.props;
    const { id } = this.props.group;
    Actions.postUnsubscribeGroup({ groupId: id, userId }).then(() => {
      // Actions.getProjectGroup({ id, userId });
    });
  };

  handleSubscribe = () => {
    const { userId } = this.props;
    const { id } = this.props.group;
    Actions.postSubscribeGroup({ groupId: id, userId }).then(() => {});
  };

  handleCreateConversation = () => {
    this.setState({
      isConversationModalVisible: true
    });
  };

  handleCancel = () => {
    this.setState({
      isConversationModalVisible: false
    });
  };

  handleOk = () => {
    this.setState({
      isConversationModalVisible: false
    });
  };

  // Renders
  renderIsOpen(isOpen) {
    return isOpen ? "Открытая группа" : "Закрытая группа";
  }
  renderConversations(conversations = []) {
    return (
      <div className="group__conversations">
        {conversations.map(this.renderConversation)}
      </div>
    );
  }

  renderConversation = conversation => {
    const { id } = this.props.match.params;
    const { userId } = this.props;
    const lastPostDate =
      conversation.lastpostdate &&
      moment(conversation.lastpostdate).format("DD MMM YYYY HH:mm");

    const link = `${id}/conversations/${conversation.id}`;
    return (
      <div className="group__conversation" key={conversation.id}>
        <div className="group__conversation-header">
          <Icon type="message" />
          <div className="group__conversation-info">
            <div className="group__conversation-title">
              <Link to={link}>{conversation.title}</Link>
            </div>
            <div className="group__conversation-badge">
              {pluralizeComments(conversation.count)}
            </div>
            <div className="group__conversation-date">{lastPostDate}</div>
          </div>
        </div>
      </div>
    );
  };

  renderJoinButton = () => {
    return (
      <Button
        className="project-group__join-button"
        onClick={this.handleSubscribe}
      >
        Присоединиться
      </Button>
    );
  };

  renderLeaveButton = () => {
    return (
      <Button
        className="project-group__leave-button"
        onClick={this.handleUnsubscribe}
      >
        Покинуть группу
      </Button>
    );
  };

  renderParticipants(participants = []) {
    return (
      <ul className="group__participants">
        {participants.map(participant => {
          return (
            <li key={participant.id}>
              <div className="group-sidebar__avatar">
                <img src={participant.avatar} alt="Участник" />
              </div>
              {participant.name}
            </li>
          );
        })}
      </ul>
    );
  }

  renderAdmins(admins = []) {
    return (
      <ul className="group__admins">
        {admins.map(admin => {
          return (
            <li key={admin.id}>
              <div className="group-sidebar__avatar">
                <img src={admin.avatar} alt="Участник" />
              </div>
              {admin.name}
            </li>
          );
        })}
      </ul>
    );
  }

  renderMaterials = (links = [], docs = [], media = []) => {
    return (
      <ul className="group__materials">
        {links.map(link => {
          return (
            <li key={link.id}>
              <a href={link.link}>{link.title}</a>
            </li>
          );
        })}
      </ul>
    );
  };

  render() {
    const {
      id,
      title,
      avatar,
      isOpen,
      conversations,
      description,
      participant,
      participants,
      admins,
      docs,
      links,
      media
    } = this.props.group || {};

    const conversationsCount = conversations && conversations.length;
    const participantsCount = participants && participants.length;
    const adminsCount = admins && admins.length;
    const docsCount = (docs && docs.length) || 0;
    const linksCount = (links && links.length) || 0;
    const mediaCount = (media && media.length) || 0;
    const materialsCount = docsCount + linksCount + mediaCount;

    const conversationsHeader = (
      <div className="group__header">
        <div style={{ display: "flex" }}>
          <div className="group__title">Обсуждения</div>
          <div className="group__conversation-count">{conversationsCount}</div>
        </div>
        <Icon type="right" />
      </div>
    );

    const participantsHeader = (
      <div className="group__header">
        <div style={{ display: "flex" }}>
          <div className="group__title">Участники</div>
          <div className="group__conversation-count">{participantsCount}</div>
        </div>
        <Icon type="right" />
      </div>
    );

    const adminsHeader = (
      <div className="group__header">
        <div style={{ display: "flex" }}>
          <div className="group__title">Администраторы</div>
          <div className="group__conversation-count">{adminsCount}</div>
        </div>
        <Icon type="right" />
      </div>
    );

    const materialsHeader = (
      <div className="group__header">
        <div style={{ display: "flex" }}>
          <div className="group__title">Материалы</div>
          <div className="group__conversation-count">{materialsCount}</div>
        </div>
        <Icon type="right" />
      </div>
    );

    return (
      <>
        <div className="group">
          <Collapse defaultActiveKey={["1"]} expandIcon={() => ""}>
            <Panel header={conversationsHeader} key="1">
              {this.renderConversations(conversations)}
            </Panel>
            <Panel header={participantsHeader} key="2">
              {this.renderParticipants(participants)}
            </Panel>
            <Panel header={adminsHeader} key="3">
              {this.renderAdmins(admins)}
            </Panel>
            <Panel header={materialsHeader} key="4">
              {this.renderMaterials(links, docs, media)}
            </Panel>
          </Collapse>
          <div style={{ marginTop: "24px" }}>
            {participant ? this.renderLeaveButton() : this.renderJoinButton()}
          </div>
          <div style={{ marginTop: "24px" }}>
            <Button onClick={this.handleCreateConversation}>
              Создать обсуждение
            </Button>
          </div>
        </div>
        <ConversationModal
          projectGroupId={id}
          visible={this.state.isConversationModalVisible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
        />
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    group: state.ProjectGroup.group,
    userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(Group);
