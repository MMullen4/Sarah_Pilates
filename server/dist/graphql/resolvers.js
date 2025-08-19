import Booking from "../models/Booking.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role,
    }, JWT_SECRET, { expiresIn: "7d" });
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
        me: async (_, __, context) => {
            if (!context.user)
                return null;
            return await User.findById(context.user.id);
        },
    },
    Mutation: {
        register: async (_, { input }) => {
            const isSarah = input.email === "sarah@example.com";
            const user = await User.create({
                ...input,
                role: isSarah ? "admin" : "user",
            });
            const token = generateToken(user);
            return { token, user };
        },
        login: async (_, { input }) => {
            const user = await User.findOne({ email: input.email });
            if (!user || !(await user.comparePassword(input.password))) {
                throw new Error("Invalid credentials");
            }
            const token = generateToken(user);
            return { token, user };
        },
        bookAppointment: async (_, { input }, context) => {
            if (!context.user)
                throw new Error("Unauthorized");
            return await Booking.create({
                ...input,
                user: context.user.id,
            });
        },
        updateBooking: async (_, { id, input }, context) => {
            if (!context.user)
                throw new Error("Unauthorized");
            const booking = await Booking.findById(id);
            if (!booking)
                throw new Error("Booking not found");
            const isAdmin = context.user.role === "admin";
            if (!isAdmin && booking.user.toString() !== context.user.id) {
                throw new Error("Forbidden: You can only update your own appointments");
            }
            return await Booking.findByIdAndUpdate(id, input, { new: true });
        },
        deleteBooking: async (_, { id }, context) => {
            if (!context.user)
                throw new Error("Unauthorized");
            const booking = await Booking.findById(id);
            if (!booking)
                throw new Error("Booking not found");
            const isAdmin = context.user.role === "admin";
            if (!isAdmin && booking.user.toString() !== context.user.id) {
                throw new Error("Forbidden: You can only delete your own appointments");
            }
            const result = await Booking.findByIdAndDelete(id);
            return !!result;
        },
        sendContactEmail: async (_, { name, email, message }) => {
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
            }
            catch (error) {
                console.error("❌ Email failed:", error);
                return false;
            }
        },
    },
};
