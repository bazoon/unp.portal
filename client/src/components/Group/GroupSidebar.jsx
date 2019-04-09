import React, { Component } from "react";
import { connect } from "react-redux";
import { Icon } from "antd";
import LinksForm from "./LinksForm";
import DocsForm from "./DocsForm";
import { Actions } from "jumpstate";

class GroupSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLinksFormVisible: false,
      isLinksListVisible: false,
      isDocsFormVisible: false,
      isDocsListVisible: false,
      isMediaVisible: false,
      isMediaFormVisible: false
    };
  }

  toggleLinksForm = () => {
    this.setState({
      isLinksFormVisible: !this.state.isLinksFormVisible
    });
  };

  toggleDocsForm = () => {
    this.setState({
      isDocsFormVisible: !this.state.isDocsFormVisible
    });
  };

  toggleMediaForm = () => {
    this.setState({
      isMediaFormVisible: !this.state.isMediaFormVisible
    });
  };

  toggleLinks = () => {
    this.setState({
      isLinksListVisible: !this.state.isLinksListVisible
    });
  };

  toggleDocs = () => {
    this.setState({
      isDocsListVisible: !this.state.isDocsListVisible
    });
  };

  toggleMedia = () => {
    this.setState({
      isMediaVisible: !this.state.isMediaVisible
    });
  };

  handleSubmitLink = ({ link, title }) => {
    const { id } = this.props.group;
    return Actions.postProjectGroupLink({ link, title, id });
  };

  handleSubmitDoc = files => {
    const { id } = this.props.group;

    const formData = new FormData();
    formData.append("ProjectGroupId", id);
    files.forEach(f => {
      formData.append("file", f);
    });
    return Actions.postProjectGroupDoc({ id, formData });
  };

  handleSubmitMedia = files => {
    const { id } = this.props.group;

    const formData = new FormData();
    formData.append("ProjectGroupId", id);
    files.forEach(f => {
      formData.append("file", f);
    });
    return Actions.postProjectGroupMedia({ id, formData });
  };

  handleRemoveLink = id => {
    Actions.postRemoveProjectGroupLink(id);
  };

  handleRemoveDoc = id => {
    Actions.postRemoveProjectGroupDoc(id);
  };

  handleRemoveMedia = id => {
    Actions.postRemoveProjectGroupMedia(id);
  };

  renderLinks(links = []) {
    return (
      <>
        <div className="group-sidebar__item">
          <div>
            <Icon type="link" onClick={this.toggleLinks} />
            <span>Ссылки</span>
            <span className="group-sidebar__item-note">
              {links && links.length}
            </span>
          </div>
          <Icon type="edit" onClick={this.toggleLinksForm} />
        </div>
        <ul className="group-sidebar__links">
          {this.state.isLinksListVisible &&
            links.map(link => {
              return (
                <li key={link.id}>
                  <span className="group-sidebar__link">
                    <Icon
                      type="close"
                      onClick={() => this.handleRemoveLink(link.id)}
                      style={{
                        fontSize: "8px",
                        marginRight: "4px"
                      }}
                    />
                    <a href={link.link}>{link.title}</a>
                  </span>
                </li>
              );
            })}
        </ul>
      </>
    );
  }

  renderDocs(docs = []) {
    return (
      <>
        <div className="group-sidebar__item">
          <div>
            <Icon type="paper-clip" onClick={this.toggleDocs} />
            <span>Документы</span>
            <span className="group-sidebar__item-note">
              {docs && docs.length}
            </span>
          </div>
          <Icon type="edit" onClick={this.toggleDocsForm} />
        </div>
        <ul className="group-sidebar__docs">
          {this.state.isDocsListVisible &&
            docs.map(doc => {
              return (
                <li key={doc.id}>
                  <span className="group-sidebar__link">
                    <Icon
                      type="close"
                      onClick={() => this.handleRemoveDoc(doc.id)}
                      style={{
                        fontSize: "8px",
                        marginRight: "4px"
                      }}
                    />
                    <a href={`/uploads/${doc.file}`}>{doc.file}</a>
                  </span>
                </li>
              );
            })}
        </ul>
      </>
    );
  }

  renderMedia(media = []) {
    return (
      <>
        <div className="group-sidebar__item">
          <div>
            <Icon type="paper-clip" onClick={this.toggleMedia} />
            <span>Фото и видео</span>
            <span className="group-sidebar__item-note">
              {media && media.length}
            </span>
          </div>
          <Icon type="edit" onClick={this.toggleMediaForm} />
        </div>
        <ul className="group-sidebar__docs">
          {this.state.isMediaVisible &&
            media.map(file => {
              return (
                <li key={file.id}>
                  <span className="group-sidebar__link">
                    <Icon
                      type="close"
                      onClick={() => this.handleRemoveMedia(file.id)}
                      style={{
                        fontSize: "8px",
                        marginRight: "4px"
                      }}
                    />
                    <a href={`/uploads/${file.file}`}>{file.file}</a>
                  </span>
                </li>
              );
            })}
        </ul>
      </>
    );
  }

  renderParticipants(participants = []) {
    return (
      <>
        <div className="group-sidebar__item">
          <div>
            <Icon type="team" />
            <span>Участники</span>
            <span className="group-sidebar__item-note">
              {participants && participants.length}
            </span>
          </div>
          <Icon type="eye" />
        </div>
        <ul>
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
      </>
    );
  }

  renderAdmins(admins = []) {
    return (
      <>
        <div className="group-sidebar__item">
          <div>
            <Icon type="meh" />
            <span>Администраторы</span>
            <span className="group-sidebar__item-note">
              {admins && admins.length}
            </span>
          </div>
          <Icon type="eye" />
        </div>
        <ul>
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
      </>
    );
  }

  render() {
    const { docs, links, media, participants, admins } = this.props.group || {};
    const firstMedia = media && media[0] && media[0].file;
    const {
      isLinksFormVisible,
      isDocsFormVisible,
      isMediaFormVisible
    } = this.state;

    return (
      <div className="group-sidebar">
        <div className="group-sidebar__item-container">
          {this.renderLinks(links)}
          {isLinksFormVisible && <LinksForm onSubmit={this.handleSubmitLink} />}
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          {this.renderDocs(docs)}
          {isDocsFormVisible && <DocsForm onSubmit={this.handleSubmitDoc} />}
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          {this.renderMedia(media)}
          {isMediaFormVisible && <DocsForm onSubmit={this.handleSubmitMedia} />}
          {firstMedia && (
            <video
              controls
              className="group-sidebar__video"
              src={`/uploads/${firstMedia}`}
            />
          )}
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          {this.renderParticipants(participants)}
        </div>
        <hr />
        <div className="group-sidebar__item-container">
          {this.renderAdmins(admins)}
        </div>
        <hr />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    group: state.ProjectGroup.group
    // userId: state.Login.userId
  };
};

export default connect(mapStateToProps)(GroupSidebar);
