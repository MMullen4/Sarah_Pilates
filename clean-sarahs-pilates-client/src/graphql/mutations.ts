import { gql } from "@apollo/client";

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
