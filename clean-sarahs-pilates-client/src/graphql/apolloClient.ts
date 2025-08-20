import { ApolloClient, InMemoryCache } from "@apollo/client";

const uri = import.meta.env.DEV
  ? "http://localhost:3000/graphql" // local dev server
  : "/graphql"; // prod: same origin on Railway

const client = new ApolloClient({ // Create an Apollo Client instance
  uri, // Set the GraphQL endpoint URI
  cache: new InMemoryCache(), // Initialize the cache for Apollo Client 
  headers: {
    authorization: localStorage.getItem("token") // Set the authorization header with the token from localStorage
      ? `Bearer ${localStorage.getItem("token")}` // If a token exists, include it in the header
      : "", // Otherwise, set it to an empty string
  },
});

export default client;
