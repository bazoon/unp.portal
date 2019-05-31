import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Input,
  Layout,
  Breadcrumb,
  Col,
  Row,
  Button,
  Icon,
  Carousel,
  Popover,
  Table
} from "antd";
import { Actions } from "jumpstate";
import { Link } from "react-router-dom";
import moment from "moment";
import MoreIcon from "../../../../images/more";
import "./Participants.less";

function renderMenu(id) {
  return (
    <div>
      <div className="page-participants__link">Удалить из группы</div>
      <div className="page-participants__link">Назначить админом</div>
    </div>
  );
}

const columns = [
  {
    title: "",
    dataIndex: "avatar",
    key: "avatar",
    render: value => {
      return <img src={value} className="page-participant__avatar" />;
    }
  },
  {
    title: "",
    dataIndex: "position",
    key: "position",
    render: (value, record) => {
      return (
        <div>
          <div>{record.name}</div>
          <div>{record.position}</div>
        </div>
      );
    }
  },
  {
    title: "",
    dataIndex: "commands",
    key: "commands",
    render: (value, record) => (
      <Popover
        placement="bottom"
        content={renderMenu(record.id)}
        trigger="click"
      >
        <div style={{ cursor: "pointer" }}>
          <MoreIcon style={{ cursor: "pointer" }} />
        </div>
      </Popover>
    )
  }
];

export class Participants extends Component {
  componentDidMount() {
    const { id } = this.props.match.params;
    Actions.getProjectGroup({ id });
  }

  render() {
    const { title, participants, avatar } = this.props.group;

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
            <div className="page-participants">
              <Table
                rowKey="id"
                showHeader={false}
                dataSource={participants}
                columns={columns}
              />
            </div>
          </Col>

          <Col span={8}>
            <div
              className="conversation__group-header"
              style={{
                backgroundImage: `url(${avatar})`
              }}
            >
              {title}
            </div>
          </Col>
        </Row>
      </>
    );
  }
}

const mapStateToProps = state => {
  return {
    group: state.ProjectGroup.group
  };
};

export default connect(mapStateToProps)(Participants);
