import Booking from "../models/Booking";

export const resolvers = {
  Query: {
    getBookings: async () => await Booking.find(),
  },
  Mutation: {
    bookAppointment: async (_: any, { input }: any) => {
      return await Booking.create(input);
    },
    updateBooking: async (_: any, { id, input }: any) => {
      return await Booking.findByIdAndUpdate(id, input, { new: true });
    },
    deleteBooking: async (_: any, { id }: any) => {
      const result = await Booking.findByIdAndDelete(id);
      return !!result;
    },
  },
};
