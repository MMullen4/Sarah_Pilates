import { Resolvers } from "@apollo/client";
import nodemailer from "nodemailer";
import Appointment from "./models/Appointment";

const resolvers: Resolvers = {
  Query: {
    services: () => [
      { id: "1", name: "Private Session", description: "One-on-one session" },
      { id: "2", name: "Group Class", description: "Small group mat class" },
    ],
  },

  Mutation: {
    bookAppointment: async (_, { name, email, date }) => {
      const appointment = await Appointment.create({ name, email, date });
      return {
        id: appointment._id.toString(),
        name: appointment.name,
        email: appointment.email,
        date: appointment.date,
      };
      console.log("Appointment booked:", appointment);
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
