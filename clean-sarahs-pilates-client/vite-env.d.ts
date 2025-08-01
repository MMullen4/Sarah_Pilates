/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URI: string;
  // add more env vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

