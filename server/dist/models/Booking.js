// models/Booking.ts
import mongoose from "mongoose";
const bookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    date: String,
    time: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});
export default mongoose.model("Booking", bookingSchema);
