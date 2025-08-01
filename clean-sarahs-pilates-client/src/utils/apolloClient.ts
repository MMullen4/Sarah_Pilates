import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// This file initializes the Apollo Client for GraphQL communication.
// set up the HTTP link to your GraphQL server endpoint / API.
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || "http://localhost:3001/graphql", // or your deployed endpoint
});

// middleware to add the authentication token to the headers of each request
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  console.log("Using token:", token); // log the token for debugging
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// create the Apollo Client instance with the HTTP link and cache
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
