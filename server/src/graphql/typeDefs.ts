import { gql } from "graphql-tag";

const typeDefs = gql`
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
    getBookings: [Booking!]!
    services: [Service]
  }

  type Mutation {
    bookAppointment(input: BookingInput!): Booking
    updateBooking(id: ID!, input: BookingInput!): Booking
    deleteBooking(id: ID!): Boolean
    sendContactEmail(name: String!, email: String!, message: String!): Boolean
  }
`;

export default typeDefs;
