import gql from "graphql-tag";

export const UsersQuery = gql`
  {
    users {
      id
      name
      login
      avatar
      isAdmin
      position {
        id
        name
      }

      organization {
        id
        name
        fullName
      }
    }
  }
`;

export const OrganizationsQuery = gql`
  {
    organizations {
      id
      name
    }
  }
`;

export const PositionsQuery = gql`
  {
    positions {
      id
      name
    }
  }
`;

export const CreateUserMutation = gql`
  mutation CreateUser($input: CreateUserInput) {
    createUser(input: $input) {
      isAdmin
      id
      name
      login
      avatar
      organization {
        id
        name
      }
      position {
        id
        name
      }
    }
  }
`;

export const EditUserMutation = gql`
  mutation EditUser($input: EditUserInput) {
    editUser(input: $input) {
      isAdmin
      id
      name
      login
      avatar
      organization {
        id
        name
      }
      position {
        id
        name
      }
    }
  }
`;

export const DeleteUserMutation = gql`
  mutation DeleteUser($id: Int) {
    deleteUser(id: $id)
  }
`;

export const GetUserQuery = gql`
  query GetUser($id: Int) {
    getUser(id: 2) {
      isAdmin
      id
      name
      login
      avatar
      organization {
        id
        name
      }
      position {
        id
        name
      }
    }
  }
`;
