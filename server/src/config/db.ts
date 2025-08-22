import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI; // full connection string
  if (!uri) {
    console.error("❌ MONGODB_URI is not defined in environment variables.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName: "sarahsPilates", // 👈 explicit, avoids confusion with "test"
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
