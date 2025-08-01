import { gql } from "@apollo/client";

export const REGISTER_USER = gql`
  mutation Register($input: SignupInput!) {
    register(input: $input) {
      token
      user {
        _id
        username
        email
        role
      }
    }
  }
`;

// nest login variables under input to match the server's expected structure
export const LOGIN_USER = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        _id
        username
        email
        role
      }
    }
  }
`;

export const BOOK_APPOINTMENT = gql`
  mutation BookAppointment($input: BookingInput!) {
    bookAppointment(input: $input) {
      _id
      name
      email
      date
      time
    }
  }
`;

export const UPDATE_BOOKING = gql`
  mutation UpdateBooking($id: ID!, $input: BookingInput!) {
    updateBooking(id: $id, input: $input) {
      _id
      name
      email
      date
      time
    }
  }
`;

export const DELETE_BOOKING = gql`
  mutation DeleteBooking($id: ID!) {
    deleteBooking(id: $id)
  }
`;
