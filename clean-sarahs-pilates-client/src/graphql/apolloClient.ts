// clean-sarahs-pilates-client/src/apolloClient.ts
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloLink,
  from,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import toast from "react-hot-toast";

const uri =
  import.meta.env.VITE_GRAPHQL_URI ||
  (import.meta.env.DEV ? "http://localhost:3001/graphql" : "/graphql");

const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));
  return forward(operation);
});

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if ((networkError as any)?.statusCode === 401) {
    toast.error("Please log in to continue.");
  }
  if (graphQLErrors?.length) {
    for (const err of graphQLErrors) toast.error(`Error: ${err.message}`);
  }
});

const httpLink = createHttpLink({ uri });

export default new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
