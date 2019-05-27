import { State, Effect, Actions } from "jumpstate";
import api from "../../api/api";

const Chat = State({
  initial: {
    users: [],
    organizations: [],
    positions: []
  },
  setAdminUsers(state, payload) {
    return { ...state, users: payload };
  },
  setAdminOrganizations(state, payload) {
    return { ...state, organizations: payload };
  },
  setAdminPositions(state, payload) {
    return { ...state, positions: payload };
  },
  addUser(state, payload) {
    const { users } = state;
    return { ...state, users: users.concat(payload) };
  },
  setDeleteUser(state, payload) {
    const { users } = state;
    return { ...state, users: users.filter(u => u.id !== payload) };
  },
  addOrganization(state, payload) {
    const { organizations } = state;
    return { ...state, organizations: [payload, ...organizations] };
  },
  setEditOrganization(state, payload) {
    const { organizations } = state;
    const organization = organizations.find(o => o.id == payload.id);
    organization.name = payload.name;
    organization.inn = payload.inn;
    return { ...state, organizations: [...organizations] };
  },
  addPosition(state, payload) {
    const { positions } = state;
    return { ...state, positions: [payload, ...positions] };
  },
  setEditPosition(state, payload) {
    const { positions } = state;
    const organization = positions.find(p => p.id == payload.id);
    organization.name = payload.name;
    return { ...state, positions: [...positions] };
  }
});

Effect("getAdminUsers", () => {
  api.get("admin/api/users").then(({ data }) => {
    Actions.setAdminUsers(data);
  });
});

Effect("getOrganizations", () => {
  api.get("admin/api/organizations").then(({ data }) => {
    Actions.setAdminOrganizations(data);
  });
});

Effect("getPositions", () => {
  api.get("admin/api/positions").then(({ data }) => {
    Actions.setAdminPositions(data);
  });
});

// Effect("getUser", payload => {
//   client
//     .query({
//       query: GetUserQuery,
//       variables: { id: payload }
//     })
//     .then(({ data }) => {
//       Actions.setEditedUser(data.getUser);
//     });
// });

Effect("createUser", payload => {
  api.post("admin/api/users/create", payload).then(({ data }) => {
    Actions.addUser(data);
  });

  // client
  //   .mutate({
  //     mutation: CreateUserMutation,
  //     variables: { input: payload }
  //   })
  //   .then(({ data }) => {
  //     Actions.addUser(data.createUser);
  //   });
});

Effect("updateUser", payload => {
  return api.post("admin/api/users/update", payload).then(() => {});
});

Effect("deleteUser", payload => {
  api.post("admin/api/users/delete", payload).then(({ data }) => {
    Actions.setDeleteUser(data);
  });
});

Effect("createOrganization", payload => {
  api.post("admin/api/organizations/create", payload).then(({ data }) => {
    Actions.addOrganization(data);
  });
});

Effect("editOrganization", payload => {
  api.post("admin/api/organizations/create", payload).then(({ data }) => {
    Actions.setEditOrganization(data);
  });
});

Effect("createPosition", payload => {
  api.post("admin/api/positions/create", payload).then(({ data }) => {
    Actions.addPosition(data);
  });
});

Effect("editPosition", payload => {
  api.post("admin/api/positions/update", payload).then(({ data }) => {
    Actions.setEditPosition(data);
  });
});

export default Chat;
