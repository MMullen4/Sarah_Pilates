import { ApolloClient, InMemoryCache } from "@apollo/client";

const isDev = import.meta.env.DEV;
const uri = isDev
  ? import.meta.env.VITE_GRAPHQL_URI || "http://localhost:3000/graphql"
  : `${window.location.origin}/graphql`;

export default new ApolloClient({
  uri,
  cache: new InMemoryCache(),
  headers: {
    authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
});
