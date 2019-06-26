import axios from "axios";
import currentUserStore from "../mst/CurrentUserStore";
import { notification } from "antd";

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

    return axios.get("/" + url, config).catch(e => {
      if (e.request.status === 401) {
        currentUserStore.logout();
      }
      notification.error({
        message: JSON.stringify(e.message)
      });
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

    return axios.delete("/" + url, config).catch(e => {
      if (e.request.status === 401) {
        currentUserStore.logout();
      }

      notification.error({
        message: JSON.stringify(e.message)
      });

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
      .post("/" + url, data, config)
      .then(data => {
        notification.success({
          message: "Запись успешно создана"
        });
        return data;
      })
      .catch(e => {
        if (e.request.status === 401) {
          currentUserStore.logout();
        }

        notification.error({
          message: JSON.stringify(e.message)
        });
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
      .put("/" + url, data, config)
      .then(data => {
        // notification.success({
        //   message: "Данные успешно обновлены"
        // });
        return data;
      })
      .catch(e => {
        if (e.request.status === 401) {
          currentUserStore.logout();
        }

        notification.error({
          message: JSON.stringify(e.message)
        });
        throw e;
      });
  }
};
window.api = api;
export default api;
