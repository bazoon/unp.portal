import socketIOClient from "socket.io-client";

const socket = socketIOClient(location.host, {
  query: {
    token: `Bearer ${localStorage.getItem("token")}`,
    userName: localStorage.getItem("userName")
  }
});

window.socket = socket;
export default socket;
