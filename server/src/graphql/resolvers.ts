import Booking from "../models/Booking";

export const resolvers = {
  Query: {
    getBookings: async () => await Booking.find().sort({ date: 1 }),
  },
  Mutation: {
    bookAppointment: async (_: any, { input }: any) => {
      const { name, email, date, time } = input;
      const booking = await Booking.create({ name, email, date, time });
      return booking;
    },
  },
};
