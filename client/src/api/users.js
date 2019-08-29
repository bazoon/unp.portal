import api from "./api";
import { notification } from "antd";

export default {
  loadAll() {
    return api.get("api/users").then(({ data }) => {
      return data;
    });
  },
  loadAllUsers() {
    return api.get("api/users").then(({ data }) => {
      return data;
    });
  },
  get(id) {
    return api.get(`admin/api/users/${id}`).then(({ data }) => {
      return data;
    });
  },
  update(payload) {
    return api
      .put("admin/api/users", payload)
      .then(({ data }) => {
        notification.success({
          message: "Данные пользователя сохранены."
        });
        return data;
      })
      .catch(e => {
        if (e.request.status === 403) {
          notification.error({
            message: "У вас нет прав на редактирование пользователя!"
          });
        } else {
          notification.error({
            message: "Во время сохранения произошла ошибка!"
          });
        }
      });
  },
  deleteUser(id) {
    return api
      .delete("admin/api/users", { id })
      .then(({ data }) => {
        return data;
      })
      .catch(e => {
        if (e.request.status === 403) {
          notification.error({
            message: "У вас нет прав на удаление пользователя!"
          });
        } else {
          notification.error({
            message: "Во время удаления произошла ошибка!"
          });
        }
        throw e;
      });
  },
  search(query) {
    return api.get(`api/users/search/${query}`).then(({ data }) => data);
  },
  getCurrent() {
    return api.get(`api/users/current`).then(({ data }) => data);
  },
  searchName(query) {
    return api.get(`api/users/searchName/${query}`).then(({ data }) => data);
  },
};
