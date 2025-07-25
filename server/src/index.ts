import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import  typeDefs from "./graphql/typeDefs";
import { resolvers } from "./graphql/resolvers";

dotenv.config();

const startServer = async () => {
  const app = express();

  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  // ✅ Correct middleware order
  app.use(cors());
  app.use(express.json()); // this sets req.body correctly
  app.use("/graphql", expressMiddleware(server));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () =>
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`)
  );
};

startServer();
