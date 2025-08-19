import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";
// 👇 ESM requires explicit .js on relative imports at runtime
import connectDB from "./config/db.js";
import typeDefs from "./graphql/typeDefs.js";
// If your resolvers live in ./graphql/resolvers/index.ts, use /index.js:
import { resolvers } from "./graphql/resolvers.js";
import jwt from "jsonwebtoken";
import path from "node:path";
import { fileURLToPath } from "node:url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// decode JWT helper
const getUserFromToken = (token) => {
    try {
        if (!token)
            return null;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
};
const startServer = async () => {
    const app = express();
    await connectDB();
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });
    await server.start();
    // CORS: permissive in dev, same-origin in prod
    app.use(cors({
        origin: process.env.NODE_ENV === "production"
            ? undefined
            : "http://localhost:5173",
        credentials: true,
    }));
    app.use(express.json());
    // HEALTHCHECK (Railway -> /health)
    app.get("/health", (_req, res) => res.status(200).send("ok"));
    // GRAPHQL ENDPOINT (keep BEFORE static + SPA fallback)
    app.use("/graphql", expressMiddleware(server, {
        context: async ({ req }) => {
            const token = (req.headers.authorization || "").replace("Bearer ", "");
            const user = getUserFromToken(token);
            return { user };
        },
    }));
    // STATIC: serve the Vite build from your client folder
    const clientDist = path.resolve(__dirname, "../../clean-sarahs-pilates-client/dist");
    app.use(express.static(clientDist));
    // SPA FALLBACK: after API routes
    app.get("*", (_req, res) => {
        res.sendFile(path.join(clientDist, "index.html"));
    });
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server ready on :${PORT} (GraphQL at /graphql)`);
    });
};
startServer();
