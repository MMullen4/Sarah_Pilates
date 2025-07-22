import { Resolvers } from "@apollo/client";
import nodemailer from "nodemailer";

const resolvers: Resolvers = {
  Query: {
    services: () => [
      { id: "1", name: "Private Session", description: "One-on-one session" },
      { id: "2", name: "Group Class", description: "Small group mat class" },
    ],
  },
  Mutation: {
    bookAppointment: (_, { name, email, date }) => {
      const appointment = {
        id: Date.now().toString(),
        name,
        email,
        date,
      };
      console.log("Appointment booked:", appointment);
      return appointment;
    },
    sendContactEmail: async (_, { name, email, message }) => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail", // or smtp provider
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: email,
          to: "mhmullen4@verizon.net",
          subject: `Contact from ${name}`,
          text: message,
        });

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
  },
};

export default resolvers;
