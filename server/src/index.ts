import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import typeDefs from "./graphql/typeDefs.js";
// If your resolvers are in a folder with index.ts, use the index.js path:
import { resolvers } from "./graphql/resolvers.js";

import jwt from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getUserFromToken = (token: string) => {
  try {
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
};

const PORT = Number(process.env.PORT) || 3000;
const clientDist = path.resolve(
  __dirname,
  "../../clean-sarahs-pilates-client/dist"
);

const startServer = async () => {
  const app = express();

  app.use(
    cors({
      origin:
        process.env.NODE_ENV === "production"
          ? undefined
          : "http://localhost:5173",
      credentials: true,
    })
  );
  app.use(express.json());

  // Healthcheck
  app.get("/health", (_req, res) => res.status(200).send("ok"));

  // Apollo
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = (req.headers.authorization || "").replace("Bearer ", "");
        const user = getUserFromToken(token);
        return { user };
      },
    })
  );

  // Serve client (log if dist missing)
  if (!fs.existsSync(clientDist)) {
    console.warn(`[WARN] Client dist not found at ${clientDist}`);
  } else {
    app.use(express.static(clientDist));
    app.get("*", (_req, res) =>
      res.sendFile(path.join(clientDist, "index.html"))
    );
  }

  // ⬇️ Start HTTP FIRST so Railway sees it's alive
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HTTP listening on :${PORT} (GraphQL at /graphql)`);
  });

  // ⬇️ Connect DB AFTER starting HTTP; don't crash if it fails
  try {
    console.log("⏳ Connecting to MongoDB…");
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", (err as Error).message);
  }
};

startServer().catch((e) => console.error("Fatal startup error:", e));
