import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// Choose the GraphQL URI based on environment:
// - Dev: Vite dev app (5173) talks to Express at 3000
// - Prod: same-origin (served by Express), so just "/graphql"
// (You can still override both with VITE_GRAPHQL_URI if you want.)
const uri = import.meta.env.DEV
  ? import.meta.env.VITE_GRAPHQL_URI || "http://localhost:3000/graphql"
  : import.meta.env.VITE_GRAPHQL_URI || "/graphql";

const httpLink = createHttpLink({
  uri,
  // Only needed if you rely on cookies; harmless otherwise:
  credentials: "include",
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  // console.log("Using token:", token); // optional
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
