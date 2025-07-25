import Booking from "../models/Booking";
import nodemailer from "nodemailer";

export const resolvers = {
  Query: {
    getBookings: async () => await Booking.find(),
    services: async () => {
      // You can return hardcoded services or fetch from DB later
      return [
        {
          id: "1",
          name: "Private Session",
          description: "1-on-1 Pilates session with Sarah",
        },
        {
          id: "2",
          name: "Group Class",
          description: "Small group Pilates training",
        },
      ];
    },
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

    sendContactEmail: async (_: any, { name, email, message }: any) => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: email,
          to: process.env.EMAIL_USER,
          subject: `New Contact Form from ${name}`,
          text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        };

        await transporter.sendMail(mailOptions);
        return true;
      } catch (error) {
        console.error("❌ Email failed:", error);
        return false;
      }
    },
  },
};
