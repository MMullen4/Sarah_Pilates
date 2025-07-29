import Booking from "../models/Booking";
import User from "../models/User"; // You'll need to create this model if it doesn't exist
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};

export const resolvers = {
  Query: {
    getBookings: async () => await Booking.find(),
    services: async () => {
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
    me: async (_: any, __: any, context: any) => {
      if (!context.user) return null;
      return await User.findById(context.user.id);
    },
  },

  Mutation: {
    // mutations for creating, updating, deleting, registering, and logging in users
    register: async (_: any, { input }: any) => {
      const user = await User.create(input);
      const token = generateToken(user);
      return { token, user };
    },
    login: async (_: any, { input }: any) => {
      const user = await User.findOne({ email: input.email });
      if (!user || !(await user.comparePassword(input.password))) {
        throw new Error("Invalid credentials");
      }
      const token = generateToken(user);
      return { token, user };
    },

    bookAppointment: async (_: any, { input }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");
      return await Booking.create(input);
    },

    updateBooking: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");
      return await Booking.findByIdAndUpdate(id, input, { new: true });
    },

    deleteBooking: async (_: any, { id }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");
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

    signup: async (_: any, { input }: any) => {
      const hashedPassword = await bcrypt.hash(input.password, 10);
      const user = await User.create({
        username: input.username,
        email: input.email,
        password: hashedPassword,
      });
      const token = jwt.sign({ _id: user._id }, JWT_SECRET);
      return { token, user };
    },
  },
};
