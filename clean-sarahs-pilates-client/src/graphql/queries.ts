import { gql } from "@apollo/client";

export const GET_BOOKINGS = gql`
  query GetBookings {
    getBookings {
      _id
      name
      email
      date
      time
      user
    }
  }
`;
