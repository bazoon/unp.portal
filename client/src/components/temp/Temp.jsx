// import React, { Component } from "react";
// import {
//   Button,
//   Input,
//   Icon,
//   Avatar,
//   Upload,
//   Select,
//   Form,
//   Row,
//   Col
// } from "antd";

// const uploadFilesQuery = gql`
//   mutation UploadFiles($input: FileUploadInput) {
//     uploadFiles(input: $input) {
//       id
//       file
//       groupId
//       size
//     }
//   }
// `;

// class Temp extends Component {
//   constructor(props) {
//     super(props);
//     this.users = [
//       {
//         id: 1,
//         name: "Foo"
//       },
//       {
//         id: 2,
//         name: "Bar"
//       }
//     ];
//     this.state = {};
//   }

//   handleFilesChanged = info => {
//     this.setState({
//       files: info.fileList
//     });
//   };

//   handleSubmit = () => {
//     this.props.form.validateFields((err, fields) => {
//       const payload = {};
//       payload.userIds = fields.userId;
//       payload.postId = fields.postId && +fields.postId;
//       payload.groupId = fields.groupId && +fields.groupId;
//       payload.messageId = fields.messageId && +fields.messageId;

//       payload.files =
//         (fields.files && fields.files.fileList.map(f => f.originFileObj)) || [];
//       payload.fileSizes =
//         (payload.files && payload.files.map(f => f.size)) || [];

//       client
//         .mutate({
//           mutation: uploadFilesQuery,
//           variables: { input: payload }
//         })
//         .then(({ data }) => {});
//     });
//   };

//   render() {
//     const { getFieldDecorator } = this.props.form;
//     const { files } = this.state;

//     return (
//       <Form>
//         <Row type="flex">
//           <Col span={12}>
//             {getFieldDecorator("userId", {})(
//               <Select mode="multiple">
//                 {this.users.map(u => (
//                   <Select.Option key={u.id} value={u.id}>
//                     {u.name}
//                   </Select.Option>
//                 ))}
//               </Select>
//             )}
//           </Col>
//         </Row>
//         <Row type="flex">
//           <Col span={12}>
//             {getFieldDecorator("postId", {})(<Input placeholder="postId" />)}
//           </Col>
//         </Row>
//         <Row type="flex">
//           <Col span={12}>
//             {getFieldDecorator("groupId", {})(<Input placeholder="groupId" />)}
//           </Col>
//         </Row>
//         <Row type="flex">
//           <Col span={12}>
//             {getFieldDecorator("messageId", {})(
//               <Input placeholder="messageId" />
//             )}
//           </Col>
//         </Row>
//         <Row>
//           <Col>
//             {getFieldDecorator("files", {})(
//               <Upload
//                 onChange={this.handleFilesChanged}
//                 fileList={files}
//                 beforeUpload={() => false}
//                 multiple
//               >
//                 <Button>
//                   <Icon type="upload" />
//                 </Button>
//               </Upload>
//             )}
//           </Col>
//         </Row>
//         <Button onClick={this.handleSubmit}>Post</Button>
//       </Form>
//     );
//   }
// }

// const WrappedGroupForm = Form.create({ name: "GroupForm" })(Temp);
// export default WrappedGroupForm;
