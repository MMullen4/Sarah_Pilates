// client/src/apolloClient.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";

const uri =
  import.meta.env.VITE_GRAPHQL_URI ||
  (import.meta.env.DEV ? "http://localhost:3000/graphql" : "/graphql");

export default new ApolloClient({
  uri,
  cache: new InMemoryCache(),
  headers: {
    authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
});
