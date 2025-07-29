import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import typeDefs from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";
import jwt from "jsonwebtoken";

dotenv.config();

const getUserFromToken = (token: string) => {
  try {
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
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

  app.use(cors());
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        const user = getUserFromToken(token.replace("Bearer ", ""));
        return { user };
      },
    })
  );

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  );
};

startServer();
