import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const isDev = import.meta.env.DEV;

// ✅ In dev, hit localhost (or whatever you run your server on)
// ✅ In production, always same-origin (served by Express)
const uri = isDev
  ? import.meta.env.VITE_GRAPHQL_URI || "http://localhost:3001/graphql"
  : "/graphql";

console.log("[Apollo] GraphQL URI:", uri);


// HTTP link to connect to the GraphQL server
const httpLink = createHttpLink({
  uri,
  // Only needed if you rely on cookies; harmless otherwise:
  credentials: "include",
});

// auth middleware to attach JWT token from localStorage to each request
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

// apollo client setup
const client = new ApolloClient({ // Create the Apollo Client instance so it can be used in the app
  link: authLink.concat(httpLink), // Combine auth and HTTP links
  cache: new InMemoryCache(), // Use an in-memory cache for Apollo Client
});

export default client;
