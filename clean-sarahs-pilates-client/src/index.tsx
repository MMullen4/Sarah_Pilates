// src/main.tsx or src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";

import App from "./App";
import client from "./utils/apolloClient";
import { ErrorBoundary } from "./ErrorBoundary"; // <-- make sure file name matches
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("❌ #root not found in index.html");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);

// quick probes to debug “blank page”
console.log("[Boot] React app mounted");
(window as any).__APP_MOUNTED = true;
