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

const getUserFromToken = (token: string) => { // Function to decode JWT token
  try {
    if (!token) {
      console.log("No token provided");
      return null;
    }
    console.log("Verifying token:", token.substring(0, 20) + "...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("Token verified, user:", decoded);
    return decoded;
  } catch (error) {
    console.log("Token verification failed:", (error as Error).message);
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
    // This line sets up the GraphQL endpoint
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization || "";
        console.log("Authorization header:", token);
        const user = getUserFromToken(token.replace("Bearer ", ""));
        console.log("Context user:", user);
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
