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
