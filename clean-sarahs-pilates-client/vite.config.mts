import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173, // You can change this if needed
//     proxy: {
//       "/graphql": {
//         target: "http://localhost:3001", // Your Express server
//         changeOrigin: true,
//       },
//     },
//   },
//   define: {
//     "import.meta.env.VITE_GRAPHQL_URI": JSON.stringify(
//       process.env.VITE_GRAPHQL_URI || "http://localhost:3001/graphql"
//     ),
//   },
// });
// clean-sarahs-pilates-client/vite.config.mts

export default defineConfig({
  plugins: [react()], // , svgr()
  // base: "/",
});
