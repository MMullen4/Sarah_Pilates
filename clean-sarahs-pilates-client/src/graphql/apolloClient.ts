// client/src/apolloClient.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";

const isDev = import.meta.env.DEV;
const uri = isDev
  ? import.meta.env.VITE_GRAPHQL_URI || "http://localhost:3000/graphql"
  : `${window.location.origin}/graphql`; // <-- forces prod to your Railway origin

export default new ApolloClient({
  uri,
  cache: new InMemoryCache(),
  headers: {
    authorization: localStorage.getItem("token")
      ? `Bearer ${localStorage.getItem("token")}`
      : "",
  },
});
