// models/Booking.ts
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  name: String,
  email: String,
  date: { type: String, required: true },
  time: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { autoIndex: false });

export const bookingSlotIndex = "unique_booking_slot";
bookingSchema.index({ date: 1, time: 1 }, { unique: true, name: bookingSlotIndex });

const Booking = mongoose.model("Booking", bookingSchema);

export async function requireBookingSlotIndex() {
  const indexes = await Booking.collection.indexes().catch((error: unknown) => {
    if (typeof error === "object" && error !== null && "code" in error && error.code === 26) {
      return [];
    }
    throw error;
  });
  const ready = indexes.some((index) =>
    index.name === bookingSlotIndex &&
    Object.keys(index.key).join(",") === "date,time" &&
    index.key.date === 1 && index.key.time === 1 &&
    index.unique === true && !index.sparse && !index.partialFilterExpression,
  );
  if (!ready) throw new Error("Booking index missing. Run the booking slot migration before starting the server.");
}

export default Booking;
