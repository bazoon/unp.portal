import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Chat = State({
  initial: { Chat: [] },
  setChat(state, payload) {
    return { chat: payload };
  }
});

Effect("getChat", payload => {
  api.get("api/chat/list").then(response => {
    Actions.setChat(response.data);
  });
});

Effect("sendChatMessage", payload => {
  api.post("api/chat/send", payload).then(response => {
    Actions.getChat();
  });
});

Effect("sendChatFile", payload => {
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
