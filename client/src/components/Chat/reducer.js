import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import socketIOClient from "socket.io-client";

const Chat = State({
  initial: { chat: [], isLoading: false },
  setChat(state, payload) {
    return { ...state, chat: payload, isLoading: false };
  },
  setIsLoading(state, payload) {
    return { ...state, isLoading: payload };
  }
});

Effect("getChat", payload => {
  api.get("api/chat/list").then(response => {
    Actions.setChat(response.data);
  });
});

Effect("sendChatMessage", payload => {
  Actions.setIsLoading(true);
  const socket = socketIOClient(location.host);
  socket.emit("channel-message", payload, () => {
    Actions.setIsLoading(false);
    Actions.getChat();
  });

  // api.post("api/chat/send", payload).then(response => {
  //   Actions.getChat();
  // });
});

Effect("sendChatFile", payload => {
  Actions.setIsLoading(true);
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  api.post("upload", payload, config).then(response => {
    const { data } = response;
    const { channelId, files } = data;

    api
      .post("api/chat/send", {
        channelId,
        message: files.map(f => f.filename),
        type: "file"
      })
      .then(() => {
        Actions.getChat();
      });
  });
});

export default Chat;
