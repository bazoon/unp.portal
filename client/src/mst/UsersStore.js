import { types, flow } from "mobx-state-tree";
import User from "./models/User";
import Group from "./models/Group";
import api from "../api/users";
import groupsApi from "../api/projectGroups";

const UsersStore = types
  .model("UsersStore", {
    users: types.array(User),
    currentUser: types.maybeNull(User),
    currentUserGroups: types.maybeNull(types.array(Group)),
    groupsTotal: types.maybeNull(types.number),
    groupsPage: types.optional(types.maybeNull(types.number), 1),
    groupsPageSize: types.optional(types.maybeNull(types.number), 10)
  })
  .views(self => ({
    get organization() {
      const user = self.currentUser;
      return user && user.organization && user.organization.name;
    },
    get position() {
      const user = self.currentUser;
      return user && user.position && user.position.name;
    },
    get surName() {
      const name = self.currentUser && self.currentUser.name;
      return name && name.split(" ")[0];
    },
    get firstName() {
      const name = self.currentUser && self.currentUser.name;
      return name && name.split(" ")[1];
    },
    get lastName() {
      const name = self.currentUser && self.currentUser.name;
      return name && name.split(" ")[2];
    }
  }))
  .actions(self => {
    const loadAllUsers = flow(function* load() {
      self.users = yield api.loadAllUsers();
    });

    const get = flow(function* load(id) {
      self.currentUser = yield api.get(id);
    });

    const loadUserGroups = flow(function* load(id) {
      const data = yield groupsApi.getAdminUserGroups({
        id,
        page: self.groupsPage,
        pageSize: self.groupsPageSize
      });
      self.currentUserGroups = data.groups;
      self.groupsTotal = data.pagination.total;
    });

    const setGroupsPagionation = function setGroupsPagionation(page) {
      self.groupsPage = page;
      self.loadUserGroups(self.currentUser.id);
    };

    return {
      loadAllUsers,
      get,
      loadUserGroups,
      setGroupsPagionation
    };
  });

export default UsersStore;
