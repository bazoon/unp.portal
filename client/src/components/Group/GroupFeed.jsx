import React, { Component } from "react";
import { connect } from "react-redux";
import { Input, Layout, Breadcrumb, Col, Row, Button, Icon } from "antd";
import { ProjectGroup } from "../ProjectGroups/ProjectGroup";
import { Actions } from "jumpstate";
import { pluralizeComments } from "../../utils/pluralize";
import Posts from "./GroupPosts";
import { Link } from "react-router-dom";
import moment from "moment";
import ConversationModal from "./Conversation/ConversationModal";
import chatWaitSvg from "../../../images/chat_wait.svg";

// const ChatIcon = props => <Icon component={chatWaitSvg} {...props} />;

const { Sider } = Layout;

class GroupFeed extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isConversationModalVisible: false
    };
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    Actions.getProjectGroup({ id });
    Actions.getOwnGroupPosts(id);
  }
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

  handleSend = (text, uploadFiles) => {
    const { id } = this.props.match.params;
    const { userId } = this.props;

    const formData = new FormData();
    formData.append("groupId", id);
    formData.append("userId", userId);
    formData.append("text", text);
    uploadFiles.forEach(f => {
      formData.append("file", f);
    });

    return Actions.sendGroupPost({ id, formData });
  };

  handleReplySend = (comment, post, files = []) => {
    const { id } = this.props.match.params;
    const { userId } = this.props;

    const formData = new FormData();

    formData.append("groupId", id);
    formData.append("postId", post.id);
    formData.append("userId", userId);
    formData.append("text", comment);

    files.forEach(f => {
      formData.append("file", f);
    });

    return Actions.sendGroupPost({ id, formData });
  };

  renderAddRegion() {
    return (
      <div
        className="group__add-region"
        onClick={this.handleCreateConversation}
      >
        Добавить запись в группе
      </div>
    );
  }

  renderParticipants() {
    const { participants } = this.props.group;
    const firstThree = participants.slice(0, 3);
    const restFive = participants.slice(3, 8);
    const rest = participants.slice(8);
    return (
      <div className="group__participants-wrap">
        <div className="group__participants-main">
          {firstThree.map(participant => {
            return (
              <div key={participant.id} className="group__participant-info">
                <div className="group__participant-avatar">
                  <img src={participant.avatar} alt="avatar" />
                </div>
                <div className="group__participant-description">
                  <div className="group__participant-role">
                    {participant.roleName}
                  </div>
                  <div className="group__participant-name">
                    {participant.name}
                  </div>
                  <div className="group__participant-position">
                    {participant.position}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="group__participants-rest">
            {restFive.map(participant => {
              return (
                <div className="group__participant-avatar group__participant-avatar_row">
                  <img src={participant.avatar} alt="avatar" />
                </div>
              );
            })}
            <div className="group__participants-more">И еще {rest.length}</div>
          </div>
        </div>
      </div>
    );
  }

  renderConversations() {
    const { id, conversations } = this.props.group;

    return (
      <div className="group__conversations">
        {conversations.map(conversation => {
          const date = moment(conversation.created_at).fromNow();
          const link = `${id}/conversation/${conversation.id}`;
          return (
            <div className="group__conversation">
              <div className="group__conversation-header">
                <div className="group__conversation-user">
                  Написал &nbsp; {conversation.name}
                </div>
                <div className="group__conversation-date">{date}</div>
              </div>
              <div className="group__conversation-title">
                {conversation.title}
              </div>
              <div className="group__conversation-description">
                {conversation.description}
              </div>
              <div className="group__conversation-footer">
                <img
                  style={{ marginRight: "8px" }}
                  src={chatWaitSvg.slice(1)}
                  className="svg-icon"
                />
                <Link to={link}>{pluralizeComments(conversation.count)}</Link>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { id, title, avatar, description } = this.props.group;

    return (
      <>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Главная</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/groups">Группы</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{title}</Breadcrumb.Item>
        </Breadcrumb>

        <Row type="flex" gutter={37}>
          <Col span={16}>
            <div className="group__feed">
              <div className="group__feed-header">
                <div className="group__feed-title">{title}</div>
                <div className="group__feed-description">{description}</div>
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="group__add-info">
              {this.renderParticipants()}
              <Button type="primary" size="large" style={{ width: "100%" }}>
                Вступить в группу
              </Button>
            </div>
          </Col>
        </Row>
        <div style={{ marginBottom: "40px" }} />
        <Row gutter={37}>
          <Col span={16}>
            {this.renderAddRegion()}
            {this.renderConversations()}
            <Posts
              posts={this.props.posts}
              onReplySend={this.handleReplySend}
              onSend={this.handleSend}
            />
          </Col>
        </Row>
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
    userId: state.Login.userId,
    posts: state.ProjectGroup.posts,
    group: state.ProjectGroup.group
  };
};

export default connect(mapStateToProps)(GroupFeed);
