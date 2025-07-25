import { ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "http://localhost:3001/graphql", // 🔁 Change if different in production
  cache: new InMemoryCache(),
});

export default client;
