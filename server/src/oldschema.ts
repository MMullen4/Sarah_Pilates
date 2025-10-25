import { gql } from "graphql-tag";

const typeDefs = gql`
  type Service {
    id: ID!
    name: String!
    description: String!
  }

  type Appointment {
    id: ID!
    name: String!
    email: String!
    date: String!
  }

  type Query {
    services: [Service]
  }

  type Mutation {
    bookAppointment(name: String!, email: String!, date: String!): Appointment
    sendContactEmail(name: String!, email: String!, message: String!): Boolean
  }
`;

export default typeDefs;
