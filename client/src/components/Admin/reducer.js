import { State, Effect, Actions } from "jumpstate";
import client from "../client";
import {
  UsersQuery,
  OrganizationsQuery,
  PositionsQuery,
  CreateUserMutation,
  DeleteUserMutation,
  GetUserQuery,
  EditUserMutation,
  CreateOrganizationMutation,
  EditOrganizationMutation,
  CreatePositionMutation,
  EditPositionMutation
} from "./queries";

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

Effect("createOrganization", payload => {
  client
    .mutate({
      mutation: CreateOrganizationMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {
      Actions.addOrganization(data.createOrganization);
    });
});

Effect("editOrganization", payload => {
  client
    .mutate({
      mutation: EditOrganizationMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {
      Actions.setEditOrganization(data.editOrganization);
    });
});

Effect("createPosition", payload => {
  client
    .mutate({
      mutation: CreatePositionMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {
      Actions.addPosition(data.createPosition);
    });
});

Effect("editPosition", payload => {
  client
    .mutate({
      mutation: EditPositionMutation,
      variables: { input: payload }
    })
    .then(({ data }) => {
      Actions.setEditPosition(data.editPosition);
    });
});

export default Chat;
