import Booking from "../models/Booking.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

const generateToken = (user: any) => {
  const secret =
    process.env.JWT_SECRET ||
    process.env.JWT_SECRET_KEY ||
    "dev-only-supersecret";
  
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
    },
    secret,
    { expiresIn: "7d" }
  );
};

export const resolvers = {
  Query: {
    // ✅ Sorted & filtered to only return today's and future bookings
    getBookings: async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const cutoff = startOfToday.getTime().toString(); // since stored as string

      return await Booking.find({ date: { $gte: cutoff } }).sort({
        date: 1,
        time: 1,
      });
    },

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
    // ✅ Registration
    register: async (_: any, { input }: any) => {
      const isSarah = input.email === "sarah@example.com";
      const user = await User.create({
        ...input,
        role: isSarah ? "admin" : "user",
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

      // ⛳ Normalize inputs (you store date as a string timestamp)
      const dateStr = String(input.date).trim(); // e.g., "1761807600000"
      const timeStr = String(input.time).trim(); // e.g., "08:00"

      // 🔐 Optional: block past times
      const nowMs = Date.now();
      const slotMs = Number.isFinite(+dateStr) ? +dateStr : Date.parse(dateStr);
      if (!Number.isFinite(slotMs)) throw new Error("Invalid date");
      if (slotMs < nowMs) throw new Error("Cannot book a past time");

      // 🚫 Prevent double-booking
      const exists = await Booking.findOne({
        date: dateStr,
        time: timeStr,
      }).lean();
      if (exists) throw new Error("That time slot is already booked");

      // ✅ Always use server-side identity (ignore client-sent name/email)
      const booking = await Booking.create({
        date: dateStr,
        time: timeStr,
        name: u.username ?? "User",
        email: u.email ?? "",
        user: context.user.id,
        createdAt: new Date().toISOString(),
      });

      return booking;
    },

    // bookAppointment: async (_: any, { input }: any, context: any) => {
    //   if (!context.user) throw new Error("Unauthorized - Please sign up or log in");

    //   const user = await User.findById(context.user.id);
    //   if (!user) throw new Error("User not found");

    //   const exists = await Booking.findOne({
    //     date: input.date,
    //     time: input.time,
    //   });
    //   if (exists) throw new Error("That time slot is already booked");

    //   return await Booking.create({
    //     ...input,
    //     name: input.name ?? user.username, // use user name already entered
    //     email: input.email ?? user.email, // use user email already entered
    //     user: context.user.id,
    //   });
    // },

    // ✅ Update booking (with ownership check)
    updateBooking: async (_: any, { id, input }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");

      const booking = await Booking.findById(id);
      if (!booking) throw new Error("Booking not found");

      const isAdmin = context.user.role === "admin";
      if (!isAdmin && booking.user.toString() !== context.user.id) {
        throw new Error("You can only edit your own appointments");
      }

      // prevent user field modification
      const { user, ...safeInput } = input || {};
      return await Booking.findByIdAndUpdate(id, safeInput, { new: true });
    },

    // ✅ Delete booking (with ownership check)
    deleteBooking: async (_: any, { id }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");

      const booking = await Booking.findById(id);
      if (!booking) throw new Error("Booking not found");

      // Debug logging
      console.log("Current user ID:", context.user.id);
      console.log("Booking user ID:", booking.user);
      console.log("Booking user toString():", booking.user.toString());
      console.log(
        "Are they equal?",
        booking.user.toString() === context.user.id
      );
      console.log("User role:", context.user.role);

      const isAdmin = context.user.role === "admin";
      if (!isAdmin && booking.user.toString() !== context.user.id) {
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
