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
    updateBooking(id: ID!, input: BookingInput!): Booking
    deleteBooking(id: ID!): Boolean
  }

  type Query {
    getBookings: [Booking!]!
  }
`;
