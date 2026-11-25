import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { normalizeBookingSlot, validateFutureBookingSlot } from "../models/bookingSlot.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../config/jwt.js";

const generateToken = (user: any) =>
  jwt.sign(
    {
      id: String(user._id),
      email: user.email,
      role: user.role,
      username: user.username,
    },
    getJwtSecret(),
    { algorithm: "HS256", expiresIn: "7d" },
  );

async function reserveSlot<T>(write: () => Promise<T>) {
  try {
    return await write();
  } catch (error) {
    if (
      error instanceof mongoose.mongo.MongoServerError &&
      error.code === 11000 &&
      error.keyPattern?.date === 1 &&
      error.keyPattern?.time === 1
    ) {
      throw new Error("That time slot is already booked");
    }
    throw error;
  }
}

export const resolvers = {
  Query: {
    // ✅ Sorted & filtered to only return today's and future bookings
    getBookings: async (_: any, __: any, context: any) => {
      const now = new Date();
      const bookings = await Booking.find().sort({ date: 1, time: 1 });

      const upcoming = bookings.filter((booking) =>
        normalizeBookingSlot(booking.date, booking.time).startsAt > now.getTime(),
      );
      // Return availability to everyone, but customer details only to the
      // booking owner or a database-verified administrator.
      const viewer = context.user?.id
        ? await User.findById(context.user.id).lean()
        : null;
      const isAdmin = viewer?.role === "admin";

      return upcoming.map((booking: any) => {
        if (isAdmin || (viewer && String(booking.user) === String(viewer._id)))
          return booking;

        return {
          _id: booking._id,
          date: booking.date,
          time: booking.time,
          name: "Booked",
          email: "",
          user: null,
        };
      });
    },

    services: async () => { // Hardcoded services for demonstration purposes
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
    // ✅ Registration
    register: async (_: any, { input }: any) => {
      // Public signups must never grant administrator privileges.
      const user = await User.create({
        username: input.username,
        email: input.email,
        password: input.password,
        role: "user",
      });
      const token = generateToken(user);
      return { token, user };
    },

    // ✅ Login
    login: async (_: any, { input }: any) => {
      const user = await User.findOne({ email: input.email });
      if (!user || !(await user.comparePassword(input.password))) {
        throw new Error("Invalid credentials");
      }
      const token = generateToken(user);
      return { token, user };
    },

    // ✅ Create a booking
    bookAppointment: async (_: any, { input }: any, context: any) => {
      if (!context.user)
        throw new Error("Unauthorized - Please sign up or log in");

      const u = await User.findById(context.user.id).lean();
      if (!u) throw new Error("User not found");

      const slot = validateFutureBookingSlot(input.date, input.time);

      // Always derive identity from auth (ignore client-sent name/email)
      return await reserveSlot(() => Booking.create({
        ...slot,
        name: u.username ?? "User",
        email: u.email ?? "",
        user: u._id,
      }));
    },

    // ✅ Update booking (with ownership check)
    updateBooking: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");

      const booking = await Booking.findById(id);
      if (!booking) throw new Error("Booking not found");

      const actingUser = await User.findById(context.user.id).lean();
      if (!actingUser) throw new Error("Unauthorized");
      const isAdmin = actingUser.role === "admin";
      if (!isAdmin && String(booking.user) !== String(actingUser._id)) {
        throw new Error("You can only edit your own appointments");
      }

      const slot = validateFutureBookingSlot(input.date, input.time);
      const updated = await reserveSlot(() => Booking.findByIdAndUpdate(
        id,
        slot,
        { new: true, runValidators: true },
      ).exec());
      if (!updated) throw new Error("Booking not found");
      return updated;
    },

    // ✅ Delete booking (with ownership check)
    deleteBooking: async (_: any, { id }: any, context: any) => {
      if (!context.user?.id) throw new Error("Unauthorized");

      const actingUser = await User.findById(context.user.id).lean();
      if (!actingUser) throw new Error("Unauthorized");

      const booking = await Booking.findById(id);
      if (!booking) throw new Error("Booking not found");

      const isAdmin = actingUser.role === "admin";
      const isOwner = String(booking.user) === String(actingUser._id);

      if (!isAdmin && !isOwner) {
        throw new Error("You can only remove your own appointments");
      }

      const result = await Booking.findByIdAndDelete(id);
      return !!result;
    },

    // ✅ Contact form email handler
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
