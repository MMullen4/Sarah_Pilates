import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink , from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

const isDev = import.meta.env.DEV;

// ✅ In dev, hit localhost (or whatever you run your server on)
// ✅ In production, always same-origin (served by Express)
const uri = isDev
  ? import.meta.env.VITE_GRAPHQL_URI || "http://localhost:3001/graphql"
  : "/graphql";

console.log("[Apollo] GraphQL URI:", uri);


// HTTP link to connect to the GraphQL server
const httpLink = createHttpLink({
  uri: uri, // Use the uri variable instead of hardcoded localhost:3001
  credentials: "include",
});

const authAndCsrfLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      "apollo-require-preflight": "true", // 👈 forces preflight Apollo accepts
      "content-type": "application/json", // 👈 ensure non-simple content type
    },
  }));
  return forward(operation);
});

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

export const client = new ApolloClient({
  link: from([authAndCsrfLink, httpLink]),
  cache: new InMemoryCache(),
});

export default client;
