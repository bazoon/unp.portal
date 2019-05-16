import { ApolloLink, concat } from "apollo-link";

const { ApolloClient } = require("apollo-client");
const { InMemoryCache } = require("apollo-cache-inmemory");
const { createUploadLink } = require("apollo-upload-client");

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext({
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`
    }
  });

  return forward(operation);
});

const uploadLink = createUploadLink({
  uri: "/graphql"
});

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, uploadLink),
  defaultOptions: { query: { fetchPolicy: "network-only" } }
});

export default client;
