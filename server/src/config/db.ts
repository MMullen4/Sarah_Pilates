import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  // Masked log to confirm what's being read
  const masked = uri.replace(/:\/\/(.*):(.*)@/, "://$1:*****@");
  console.log("🔑 Using MONGODB_URI:", masked);

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
export const isDbConnected = (): boolean =>
  mongoose.connection.readyState === 1;

export default connectDB;
