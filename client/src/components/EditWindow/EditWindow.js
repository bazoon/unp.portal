import React, { Component } from "react";
import { Button, Modal, Input, Table, Select, Icon } from "antd";

class EditWindow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  handleClick = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = () => {
    this.setState({
      visible: false
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  onSelect = record => {
    this.props.onSelect(record.id);
    this.setState({
      visible: false
    });
  };

  onRow = record => {
    return {
      onDoubleClick: this.onSelect.bind(this, record)
    };
  };

  handleChange = id => {
    this.props.onSelect(id);
  };

  render() {
    const {
      dataSource,
      columns,
      title,
      onAdd,
      isInEditMode,
      editForm
    } = this.props;
    const { visible } = this.state;

    return (
      <>
        <Select
          onChange={this.handleChange}
          value={this.props.value}
          suffixIcon={<Icon type="edit" onClick={this.handleClick} />}
        >
          {this.props.dataSource.map(o => {
            return (
              <Select.Option key={o.id} value={o.id}>
                {o.name}
              </Select.Option>
            );
          })}
        </Select>

        <Modal
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          title={title}
        >
          {!isInEditMode ? (
            <>
              <Button style={{ marginBottom: "10px" }} onClick={onAdd}>
                Добавить
              </Button>
              <Table
                rowKey="id"
                dataSource={dataSource}
                columns={columns}
                onRow={this.onRow}
                pagination={{ pageSize: 5 }}
              />
            </>
          ) : (
            editForm
          )}
        </Modal>
      </>
    );
  }
}

export default EditWindow;
