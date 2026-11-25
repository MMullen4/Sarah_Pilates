import mongoose from "mongoose";
import Booking, { requireBookingSlotIndex } from "../models/Booking.js";
import { normalizeBookingSlot } from "../models/bookingSlot.js";

async function migrate() {
  const mode = process.argv[2];
  if (process.argv.length !== 3 || (mode !== "--check" && mode !== "--apply")) {
    throw new Error("Specify --check or --apply.");
  }
  // Deliberately require an explicit URI without loading application .env files.
  const uri = process.env.BOOKING_MIGRATION_URI;
  if (!uri) throw new Error("Set BOOKING_MIGRATION_URI to the target database URI.");
  await mongoose.connect(uri, { autoCreate: false, autoIndex: false });

  const updates = [];
  const slots = new Map<string, string>();
  let hasIssues = false;
  let checked = 0;
  for await (const record of Booking.collection.find({}, { projection: { date: 1, time: 1 } })) {
    checked++;
    let slot: ReturnType<typeof normalizeBookingSlot>;
    try {
      slot = normalizeBookingSlot(record.date, record.time);
    } catch {
      console.error(JSON.stringify({ invalid: String(record._id), date: record.date, time: record.time }));
      hasIssues = true;
      continue;
    }

    const key = `${slot.date}/${slot.time}`;
    const firstId = slots.get(key);
    if (firstId) {
      console.error(JSON.stringify({ duplicateSlot: key, ids: [firstId, String(record._id)] }));
      hasIssues = true;
    } else {
      slots.set(key, String(record._id));
    }

    if (slot.date !== record.date || slot.time !== record.time) {
      const next = { date: slot.date, time: slot.time };
      console.log(JSON.stringify({
        id: String(record._id),
        before: { date: record.date, time: record.time },
        after: next,
      }));
      updates.push({
        updateOne: {
          filter: { _id: record._id, date: record.date, time: record.time },
          update: { $set: next },
        },
      });
    }
  }

  console.log(`Checked ${checked} appointments. ${updates.length} require normalization.`);
  if (hasIssues) throw new Error("Resolve the reported records before applying the migration.");
  if (mode === "--check") return;

  if (updates.length) {
    const result = await Booking.collection.bulkWrite(updates);
    if (result.matchedCount !== updates.length) {
      throw new Error("Bookings changed during migration. Stop all booking writers and rerun the audit.");
    }
  }
  await Booking.createIndexes();
  await requireBookingSlotIndex();
  console.log("Booking slot index verified.");
}

migrate()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
