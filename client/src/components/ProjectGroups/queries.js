import gql from "graphql-tag";

export const GroupsQuery = gql`
  {
    projectGroups {
      id
      title
      avatar
      description
      isOpen
      count
      participant
    }
  }
`;

export const SubscribeMutation = gql`
  mutation SubscribeToGroup($groupId: Int!) {
    subscribeToGroup(groupId: $groupId) {
      id
      title
    }
  }
`;

export const UnsubscribeMutation = gql`
  mutation UnsubscribeFromGroup($groupId: Int!) {
    unsubscribeFromGroup(groupId: $groupId) {
      id
      title
    }
  }
`;

export const CreateGroupMutation = gql`
  mutation CreateGroup($input: CreateProjectInput) {
    createGroup(input: $input) {
      id
      title
      avatar
      description
      participant
      isOpen
      count
    }
  }
`;
