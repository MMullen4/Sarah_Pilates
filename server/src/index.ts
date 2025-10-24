// src/index.ts
import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

// import connectDB, { isDbConnected } from "./config/db.js";
import connectDB, { isDbConnected } from "./config/db.js";
import typeDefs from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";

// ---- dotenv: explicit paths (dev + built) ----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/.env when running with tsx from src/
dotenv.config({ path: path.resolve(__dirname, "../.env") });
// fallback to repo root .env (optional)
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
}

const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// ---- CORS: allow list via env (comma-separated), default localhost:5173 in dev ----
const allowedOrigins =
  process.env.ALLOWED_ORIGINS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ||
  (NODE_ENV === "development" ? ["http://localhost:5173"] : []);

const corsOptions: CorsOptions = {
  origin: (origin, cb) => {
    // allow same-origin (no Origin header) and explicit allowlist
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
};

// ---- JWT helper ----
type UserClaims = JwtPayload & { id: string; email: string; role?: string };

const getUserFromToken = (token?: string): UserClaims | null => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("❌ JWT_SECRET missing");
    return null;
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, secret);
    return typeof decoded === "string" ? null : (decoded as UserClaims);
  } catch {
    return null;
  }
};

// ---- static client path (only if you actually ship the client here) ----
const clientDist = path.resolve(
  __dirname,
  "../../clean-sarahs-pilates-client/dist"
);

const startServer = async () => {
  const app = express();

  // CORS + JSON
  // app.use(cors(corsOptions));
  if (NODE_ENV === "development") {
    app.use(
      cors({
        origin: ["http://localhost:5173"],
        credentials: true,
      })
    );
  } else {
    // Same-origin in prod → no CORS needed
    // If you ever split domains, flip this to cors({ origin: ["https://www.sarah-pilates-mb.com"], credentials: true })
  }

  app.use(express.json({ limit: "1mb" }));

  // Healthchecks
  app.get("/health", (_req, res) => res.status(200).send("ok"));

  app.get("/health/db", (_req, res) =>
    res
      .status(isDbConnected() ? 200 : 503)
      .json({ dbConnected: isDbConnected() })
  );

  // Apollo
  const server = new ApolloServer({ typeDefs, resolvers });
  try {
    await server.start(); // start Apollo server
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
  } catch (error) {
    console.error("❌ Apollo Server failed to start:", error);
    process.exit(1);
  }

  // Serve client in production
 if (fs.existsSync(clientDist)) {
   app.use(express.static(clientDist, { maxAge: "1y" })); // no need for index:false

   app.get("*", (req, res, next) => {
     // never intercept API or other server routes
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

  // Connect DB after starting HTTP
  try {
    console.log("⏳ Connecting to MongoDB…");
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err: any) {
    console.error("❌ MongoDB connection failed:", err?.message || err);
  }
};

startServer().catch((e) => {
  console.error("Fatal startup error:", e);
  process.exit(1);
});
