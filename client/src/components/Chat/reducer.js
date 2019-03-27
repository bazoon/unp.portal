import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import socketIOClient from "socket.io-client";

const Chat = State({
  initial: { chat: [], isLoading: false, activeChannelId: undefined },
  setChatChannels(state, payload) {
    return { ...state, channels: payload };
  },
  setChatChannelMessages(state, { activeChannelId, messages }) {
    // TODO разобраться почему спред оператор не создает новый массив каналов
    const newState = { ...state, activeChannelId };
    const channels = state.channels.map(channel => channel);
    const channel = channels.find(c => c.id === activeChannelId);
    channel.messages = [...messages];
    return { ...newState, channels };
  },
  setChat(state, payload) {
    return { ...state, chat: payload, isLoading: false, socketError: false };
  },
  setIsLoading(state, payload) {
    return { ...state, isLoading: payload };
  },
  setError(state) {
    return { ...state, socketError: true };
  },
  setMoreMessages(state, { activeChannelId, messages }) {
    const newState = {
      ...state,
      chat: [...state.chat]
    };
    const channel = newState.chat.find(ch => ch.id == activeChannelId);
    if (channel) {
      channel.messages = [...messages, ...channel.messages];
    }

    return newState;
  }
});

Effect("getChannels", () => {
  api.get("api/chat/channels").then(response => {
    Actions.setChatChannels(response.data);
  });
});

Effect("getChannelMessages", activeChannelId => {
  api.get("api/chat/messages", { activeChannelId }).then(response => {
    Actions.setChatChannelMessages({
      activeChannelId,
      messages: response.data
    });
  });
});

Effect("getChat", () => {
  api.get("api/chat/list").then(response => {
    Actions.setChat(response.data);
  });
});

Effect("getMoreMessages", activeChannelId => {
  api.get("api/chat/more", { activeChannelId }).then(response => {
    Actions.setMoreMessages(response.data);
  });
});

Effect("chatMarkAsRead", payload => {
  const socket = socketIOClient(location.host, {
    query: {
      token: localStorage.getItem("token"),
      expiresIn: localStorage.getItem("expiresIn"),
      userName: localStorage.getItem("userName")
    }
  });
  socket.emit("channel-message-mark", payload, () => {});
});

Effect("sendChatMessage", payload => {
  Actions.setIsLoading(true);
  const socket = socketIOClient(location.host, {
    query: {
      token: localStorage.getItem("token")
    }
  });

  socket.on("error", error => {
    Actions.setError();
    Actions.setIsLoading(false);
    if (error === "jwt expired") {
      Actions.logout();
    }
  });

  socket.emit("channel-message", payload, () => {
    Actions.setIsLoading(false);
    Actions.getChat();
  });

  // api.post("api/chat/send", payload).then(response => {
  //   Actions.getChat();
  // });
});

Effect("sendChatFile", payload => {
  const socket = socketIOClient(location.host);
  Actions.setIsLoading(true);
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  api.post("upload", payload, config).then(response => {
    const { data } = response;
    const { channelId, files } = data;

    socket.emit(
      "channel-message",
      {
        channelId,
        message: files.map(f => f.filename),
        type: "file"
      },
      () => {
        Actions.setIsLoading(false);
        Actions.getChat();
      }
    );

    // api
    //   .post("api/chat/send", {
    //     channelId,
    //     message: files.map(f => f.filename),
    //     type: "file"
    //   })
    //   .then(() => {
    //     Actions.getChat();
    //     Actions.notifyUpload();
    //   });
  });
});

export default Chat;
