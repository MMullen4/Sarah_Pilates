import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: String,
});

export default mongoose.model("Appointment", appointmentSchema);
