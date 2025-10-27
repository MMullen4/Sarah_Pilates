import { gql } from "graphql-tag";

const typeDefs = gql`
  type Booking {
    _id: ID!
    name: String!
    email: String!
    date: String!
    time: String!
    user: ID! 
    createdAt: String
  }

  input BookingInput {
    name: String
    email: String
    date: String!
    time: String!
  }

  input SignupInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    getBookings: [Booking!]!
    services: [Service!]!
  }

  type Mutation {
    register(input: SignupInput!): AuthPayload
    login(input: LoginInput!): AuthPayload

    # Booking management
    bookAppointment(input: BookingInput!): Booking
    updateBooking(id: ID!, input: BookingInput!): Booking
    deleteBooking(id: ID!): Boolean

    # Contact form
    sendContactEmail(name: String!, email: String!, message: String!): Boolean
  }

  type Service {
    id: ID!
    name: String!
    description: String!
  }
`;

export default typeDefs;
