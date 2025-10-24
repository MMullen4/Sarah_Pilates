import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import App from "./App";

import { ErrorBoundary } from "./ErrorBoundry";
import React from "react";

import client from "./utils/apolloClient";

import "./index.css";

// const root = ReactDOM.createRoot(document.getElementById("root")!);
// root.render(
//   <ApolloProvider client={client}>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </ApolloProvider>
// );
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
