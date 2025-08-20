import mongoose from "mongoose";

const connectDB = async () => { // Function to connect to MongoDB
  const uri = process.env.MONGODB_URI; // Get MongoDB URI from environment variables
  if (!uri) { // Check if the URI is defined
    console.error("❌ MONGODB_URI is not defined in environment variables.");
    process.exit(1); // Exit the process if URI is not defined
  }

  try { // Try to connect to MongoDB
    await mongoose.connect(uri); // Connect to MongoDB using the URI
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

export default connectDB; // Export the connectDB function for use in other parts of the application
