// src/index.ts
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import connectDB, { isDbConnected } from "./config/db.js";
import typeDefs from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";

// ---- dotenv: explicit paths (dev + built) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/.env when running with tsx from src/
// Load server/.env first
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Then load root .env (won't override existing values)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// ---- JWT helper ----
type UserClaims = JwtPayload & { id: string; email: string; role?: string };

const getUserFromToken = (token?: string): UserClaims | null => {
  const secret =
    process.env.JWT_SECRET ||
    process.env.JWT_SECRET_KEY ||
    "dev-only-supersecret";

  console.log("Using JWT secret:", secret);

  if (!secret) {
    console.error("❌ JWT secret missing (set JWT_SECRET or JWT_SECRET_KEY)");
    return null;
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret);
    return typeof decoded === "string" ? null : (decoded as UserClaims);
  } catch (e) {
    console.warn("JWT verify failed:", (e as Error).message);
    return null;
  }
};

// ---- static client path ----
// const clientDist = path.resolve(
//   __dirname,
//   "../../clean-sarahs-pilates-client/dist"
// );

const clientDist = path.join(process.cwd(), "clean-sarahs-pilates-client/dist");

console.log("__dirname:", __dirname);
console.log("clientDist path:", clientDist);
console.log("Client dist exists:", fs.existsSync(clientDist));

const startServer = async () => {
  try {
    console.log("⏳ Connecting to MongoDB…");
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err?.message || err);
    process.exit(1);
  }

  const app = express();

  app.use(express.json({ limit: "1mb" }));

  // Healthchecks
  app.get("/health", (_req, res) => res.status(200).send("ok"));
  app.get("/health/db", (_req, res) =>
    res.status(200).json({ dbConnected: isDbConnected() })
  );

  // create a new ApolloServer instance 
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = (req.headers.authorization || "").replace(
          /^Bearer\s+/i,
          ""
        );
        const user = getUserFromToken(token);
        return { user };
      },
    })
  );

  // Serve client in production
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist, { maxAge: "1y" }));

    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/graphql") || req.path.startsWith("/health"))
        return next();
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    console.warn(`[WARN] Client dist not found at ${clientDist}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🚀 HTTP listening on :${PORT} (${NODE_ENV}) • GraphQL at /graphql`
    );
  });
};

startServer().catch((e) => {
  console.error("Fatal startup error:", e);
  process.exit(1);
});
