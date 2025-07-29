import mongoose, { Document } from "mongoose";
import bcrypt from "bcryptjs";

interface IUser extends Document {
  // Represents a user document in MongoDB
  username: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema( // Define the user schema
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Pre-save hook to hash password
  if (!this.isModified("password")) return next(); // Skip hashing if password is not modified
  this.password = await bcrypt.hash(this.password, 10); // Hash the password with bcrypt
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", userSchema);
