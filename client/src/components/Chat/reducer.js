import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";
import socketIOClient from "socket.io-client";

const Chat = State({
  initial: {
    chat: [],
    isLoading: false,
    activeChannelId: undefined,
    activePages: {},
    channelHasMessages: {},
    lastMessageId: undefined,
    allChannels: []
  },
  setChatChannels(state, payload) {
    return { ...state, channels: payload };
  },
  setAllChannels(state, payload) {
    return { ...state, allChannels: payload };
  },
  addChannel(state, payload) {
    const { channels } = state;
    const newChannels = [...channels, payload];
    return { ...state, channels: newChannels };
  },
  setActiveChannel(state, activeChannelId) {
    return { ...state, activeChannelId };
  },
  setChatChannelMessages(state, { channelId, messages }) {
    // TODO разобраться почему спред оператор не создает новый массив каналов
    const newState = { ...state, activeChannelId: channelId };
    const channels = state.channels.map(channel => channel);
    const channel = channels.find(c => c.id === channelId);
    channel.messages = [...messages];

    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageId = lastMessage.id;
      newState.lastMessageId = lastMessageId;
    }

    return { ...newState, channels };
  },
  addNewMessage(state, { activeChannelId, message }) {
    const newState = { ...state };
    const channels = state.channels.map(channel => channel);
    const channel = channels.find(c => c.id === activeChannelId);
    channel.messages = [...channel.messages, message];
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
  setMoreMessages(state, { messages, activeChannelId, currentPage }) {
    const newState = { ...state, activeChannelId: state.activeChannelId };
    newState.activePages[activeChannelId] = currentPage;
    const channels = state.channels.map(channel => channel);
    const channel = channels.find(c => c.id === state.activeChannelId);

    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageId = lastMessage.id;
      newState.lastMessageId = lastMessageId;
      channel.messages = [...messages, ...channel.messages];
    } else {
      newState.channelHasMessages[activeChannelId] = false;
    }

    return { ...newState, channels };
  }
});

Effect("getChannels", userId => {
  api.get("api/chat/channels", { userId }).then(response => {
    Actions.setChatChannels(response.data);
  });
});

Effect("getAllChannels", userId => {
  api.get("api/chat/channels/all", { userId }).then(response => {
    Actions.setAllChannels(response.data);
  });
});

Effect("postCreateChannel", payload => {
  return api.post("api/chat/channels/create", payload).then(response => {
    return Actions.addChannel(response.data);
  });
});

Effect("postCreatePrivateChannel", payload => {
  return api.post("api/chat/channels/createPrivate", payload).then(response => {
    return Actions.addChannel(response.data);
  });
});

Effect("getChannelMessages", ({ channelId, currentPage }) => {
  Actions.setIsLoading(true);
  api.get("api/chat/messages", { channelId, currentPage }).then(response => {
    Actions.setIsLoading(false);
    Actions.setChatChannelMessages({
      channelId,
      messages: response.data
    });
  });
});

Effect("getChat", () => {
  api.get("api/chat/list").then(response => {
    Actions.setChat(response.data);
  });
});

Effect("getMoreMessages", ({ activeChannelId, currentPage, lastMessageId }) => {
  Actions.setIsLoading(true);
  api
    .get("api/chat/messages", {
      channelId: activeChannelId,
      currentPage,
      lastMessageId
    })
    .then(response => {
      Actions.setIsLoading(false);
      Actions.setMoreMessages({
        messages: response.data,
        activeChannelId,
        currentPage
      });
    });
});

Effect("chatMarkAsRead", payload => {
  const socket = socketIOClient(location.host, {
    query: {
      token: localStorage.getItem("token"),
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
    // Actions.getChat();
  });

  // api.post("api/chat/send", payload).then(response => {
  //   Actions.getChat();
  // });
});

Effect("sendChatFile", ({ payload, userId }) => {
  const socket = socketIOClient(location.host, {
    query: {
      token: localStorage.getItem("token")
    }
  });

  Actions.setIsLoading(true);
  const config = { headers: { "Content-Type": "multipart/form-data" } };
  api.post("api/chat/upload", payload, config).then(response => {
    const { data } = response;
    const { channelId, files } = data;
    console.log(777, files);

    socket.emit(
      "channel-message",
      {
        channelId,
        userId,
        message: "",
        files,
        type: "file"
      },
      () => {
        Actions.setIsLoading(false);
        // Actions.getChat();
      }
    );
  });
});

export default Chat;
