import axios from "axios";
import currentUserStore from "../mst/CurrentUserStore";

const api = {
  get: (url, params = {}, skipTokenCheck) => {
    const storedToken = localStorage.getItem("token");

    if (!skipTokenCheck && (!storedToken || storedToken === "undefined")) {
      return Promise.resolve({ data: null });
    }

    const token = `Bearer ${storedToken}`;
    const config = {
      headers: { authorization: token },
      params
    };

    return axios.get(`/${url}`, config).catch(e => {
      if (e.request.status === 401) {
        currentUserStore.logout();
      }
      console.error(e.message);
      throw e;
    });
  },
  delete: (url, params = {}, skipTokenCheck) => {
    const storedToken = localStorage.getItem("token");

    if (!skipTokenCheck && (!storedToken || storedToken === "undefined")) {
      return Promise.resolve({ data: null });
    }

    const token = `Bearer ${storedToken}`;
    const config = {
      headers: { authorization: token },
      params
    };

    return axios.delete(`/${url}`, config).catch(e => {
      if (e.request.status === 401) {
        currentUserStore.logout();
      }

      if (e.request.status !== 403) {
        console.error(e.message);
      }

      throw e;
    });
  },
  post: (url, data, skipTokenCheck) => {
    const storedToken = localStorage.getItem("token");
    if (!skipTokenCheck) {
      if (!skipTokenCheck && (!storedToken || storedToken === "undefined")) {
        return Promise.resolve({ data: null });
      }
    }
    const token = `Bearer ${storedToken}`;
    const config = {
      headers: { authorization: token }
    };

    return axios
      .post(`/${url}`, data, config)
      .then(data => {
        return data;
      })
      .catch(e => {
        if (e.request.status === 401) {
          currentUserStore.logout();
        }

        console.error(e.message);
        throw e;
      });
  },
  put: (url, data, skipTokenCheck) => {
    const storedToken = localStorage.getItem("token");
    if (!skipTokenCheck) {
      if (!skipTokenCheck && (!storedToken || storedToken === "undefined")) {
        return Promise.resolve({ data: null });
      }
    }
    const token = `Bearer ${storedToken}`;
    const config = {
      headers: { authorization: token }
    };

    return axios
      .put(`/${url}`, data, config)
      .then(data => {
        return data;
      })
      .catch(e => {
        if (e.request.status === 401) {
          currentUserStore.logout();
        }
        // Ошибки связанные с правами обрабатываются уровнем выше
        if (e.request.status !== 403) {
          console.error(e.message);
        }
        throw e;
      });
  }
};
window.api = api;
export default api;
