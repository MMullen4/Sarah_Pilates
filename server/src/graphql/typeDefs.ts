import { gql } from "graphql-tag";

export const typeDefs = gql`
  type Booking {
    _id: ID!
    name: String!
    email: String!
    date: String!
    time: String!
    createdAt: String
  }

  input BookingInput {
    name: String!
    email: String!
    date: String!
    time: String!
  }

  type Mutation {
    bookAppointment(input: BookingInput!): Booking
  }

  type Query {
    getBookings: [Booking!]!
  }
`;
