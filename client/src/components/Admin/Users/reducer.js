import { State, Effect, Actions } from "jumpstate";
import client from "../../client";
import { connect } from "react-redux";
import {
  UsersQuery,
  OrganizationsQuery,
  PositionsQuery,
  CreateUserMutation,
  DeleteUserMutation,
  GetUserQuery,
  EditUserMutation
} from "../queries";

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
  }
});

Effect("getAdminUsers", () => {
  client
    .query({
      query: UsersQuery
    })
    .then(({ data }) => {
      Actions.setAdminUsers(data.users);
    });
});

Effect("getOrganizations", () => {
  client
    .query({
      query: OrganizationsQuery
    })
    .then(({ data }) => {
      Actions.setAdminOrganizations(data.organizations);
    });
});

Effect("getPositions", () => {
  client
    .query({
      query: PositionsQuery
    })
    .then(({ data }) => {
      Actions.setAdminPositions(data.positions);
    });
});

Effect("getUser", payload => {
  client
    .query({
      query: GetUserQuery,
      variables: { id: payload }
    })
    .then(({ data }) => {
      Actions.setEditedUser(data.getUser);
    });
});

Effect("createUser", payload => {
  client
    .mutate({
      mutation: CreateUserMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {
      Actions.addUser(data.createUser);
    });
});

Effect("editUser", payload => {
  client
    .mutate({
      mutation: EditUserMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {});
});

Effect("deleteUser", payload => {
  client
    .mutate({
      mutation: DeleteUserMutation,
      variables: { id: payload }
    })
    .then(({ data }) => {
      Actions.setDeleteUser(data.deleteUser);
    });
});

export default Chat;
