import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { ApolloServer } from "@apollo/server";
import mongoose from "mongoose";
import { resolvers } from "../src/graphql/resolvers.js";
import typeDefs from "../src/graphql/typeDefs.js";
import Booking, { requireBookingSlotIndex } from "../src/models/Booking.js";
import User from "../src/models/User.js";

const port = Number(process.env.BOOKING_TEST_MONGO_PORT ?? 27017);
assert.ok(Number.isInteger(port) && port > 0 && port <= 65535);
const uri = `mongodb://127.0.0.1:${port}/booking_test_${randomUUID().replaceAll("-", "")}`;
const api = new ApolloServer<{ user?: { id: string; role?: string } }>({ typeDefs, resolvers });
const future = "2099-07-14";
const owner = new mongoose.Types.ObjectId();
const customer = new mongoose.Types.ObjectId();
const admin = new mongoose.Types.ObjectId();

before(async () => {
  await api.start();
  await mongoose.connect(uri, { autoCreate: false, autoIndex: false, serverSelectionTimeoutMS: 4000 });
  await assert.rejects(requireBookingSlotIndex(), /Booking index missing/);
  await User.collection.insertMany([
    { _id: owner, username: "Owner", email: "owner@example.test", role: "user" },
    { _id: customer, username: "Customer", email: "customer@example.test", role: "user" },
    { _id: admin, username: "Admin", email: "admin@example.test", role: "admin" },
  ]);
});

after(async () => {
  await api.stop();
  try {
    if (mongoose.connection.readyState === 1) await mongoose.connection.dropDatabase();
  } finally {
    await mongoose.disconnect();
  }
});

const create = "mutation($input: BookingInput!) { booking: bookAppointment(input: $input) { _id date time email } }";
const edit = "mutation($id: ID!, $input: BookingInput!) { booking: updateBooking(id: $id, input: $input) { _id date time email } }";
const remove = "mutation($id: ID!) { deleteBooking(id: $id) }";
const read = "{ getBookings { _id date time email } }";

async function operation(query: string, variables = {}, id?: mongoose.Types.ObjectId, role?: string) {
  const result = await api.executeOperation(
    { query, variables },
    { contextValue: id ? { user: { id: String(id), role } } : {} },
  );
  assert.equal(result.body.kind, "single");
  return result.body.singleResult;
}

function migration(mode: "--check" | "--apply") {
  const { status, stdout, stderr, error } = spawnSync(
    process.execPath, ["--import", "tsx", "src/scripts/migrateBookingSlots.ts", mode],
    { env: { ...process.env, BOOKING_MIGRATION_URI: uri }, encoding: "utf8" },
  );
  if (error) throw error;
  return { status, output: stdout + stderr };
}

test("dry run and blocked migration retain every appointment, then apply is repeatable", async () => {
  const legacy = await Booking.collection.insertOne({ date: future, time: "8:0", user: owner, name: "Owner", email: "owner@example.test" });
  const duplicate = await Booking.collection.insertOne({
    date: String(Date.parse(`${future}T07:00:00Z`)), time: "08:00", user: customer, name: "Customer", email: "customer@example.test",
  });
  const invalid = await Booking.collection.insertOne({ date: "bad", time: "08:00", user: admin, name: "Admin", email: "admin@example.test" });
  const blocked = migration("--apply");
  assert.equal(blocked.status, 1, blocked.output);
  assert.match(blocked.output, /duplicateSlot/);
  assert.match(blocked.output, /invalid/);
  assert.equal(await Booking.collection.countDocuments(), 3);
  assert.equal((await Booking.collection.findOne({ _id: legacy.insertedId }))?.time, "8:0");

  await Booking.collection.updateOne({ _id: duplicate.insertedId }, { $set: { time: "09:00" } });
  await Booking.collection.updateOne({ _id: invalid.insertedId }, { $set: { date: future, time: "10:00" } });
  const audit = migration("--check");
  assert.equal(audit.status, 0, audit.output);
  assert.equal((await Booking.collection.findOne({ _id: legacy.insertedId }))?.time, "8:0");
  for (let run = 0; run < 2; run++) {
    const applied = migration("--apply");
    assert.equal(applied.status, 0, applied.output);
  }
  await requireBookingSlotIndex();
  assert.equal(await Booking.collection.countDocuments(), 3);
  assert.equal((await Booking.collection.findOne({ _id: legacy.insertedId }))?.time, "08:00");
});

test("simultaneous equivalent creates and a create/edit race each leave one reservation", async () => {
  const legacyDate = String(Date.parse(`${future}T07:00:00Z`));
  const creates = await Promise.all([
    operation(create, { input: { date: future, time: "11:0" } }, owner),
    operation(create, { input: { date: legacyDate, time: "11:00" } }, customer),
  ]);
  assert.equal(creates.filter((result) => result.data?.booking).length, 1);
  assert.deepEqual(creates.flatMap((result) => result.errors?.map(({ message }) => message) ?? []),
    ["That time slot is already booked"]);
  assert.equal(await Booking.countDocuments({ date: legacyDate, time: "11:00" }), 1);

  const existing = await operation(create, { input: { date: future, time: "12:00" } }, owner);
  const id = (existing.data?.booking as { _id: string })._id;
  const moves = await Promise.all([
    operation(edit, { id, input: { date: future, time: "13:00" } }, owner),
    operation(create, { input: { date: legacyDate, time: "13:0" } }, customer),
  ]);
  assert.equal(moves.filter((result) => result.data?.booking).length, 1);
  assert.deepEqual(moves.flatMap((result) => result.errors?.map(({ message }) => message) ?? []),
    ["That time slot is already booked"]);
  assert.equal(await Booking.countDocuments({ date: legacyDate, time: "13:00" }), 1);
});

test("edit permissions come from MongoDB and the same past rule applies to everyone", async () => {
  const input = { date: future, time: "14:00" };
  const existing = await operation(create, { input }, owner);
  const id = (existing.data?.booking as { _id: string })._id;
  const past = { date: "2000-01-01", time: "08:00" };
  for (const [query, variables, actor] of [
    [create, { input: past }, owner],
    [edit, { id, input: past }, owner],
    [edit, { id, input: past }, admin],
  ] as const) {
    assert.match((await operation(query, variables, actor)).errors?.[0].message ?? "", /past time/);
  }
  assert.match((await operation(edit, { id, input })).errors?.[0].message ?? "", /Unauthorized/);
  assert.match((await operation(edit, { id, input }, customer, "admin")).errors?.[0].message ?? "", /own appointments/);
  assert.match((await operation(remove, { id }, customer, "admin")).errors?.[0].message ?? "", /own appointments/);
  const own = await operation(edit, { id, input }, owner);
  assert.ok(own.data?.booking, "owner can save the original slot");
  const updated = await operation(edit, { id, input: { ...input, time: "15:00" } }, admin, "user");
  assert.equal((updated.data?.booking as { email: string }).email, "owner@example.test");
  const guests = (await operation(read)).data?.getBookings as Array<{ _id: string; email: string }>;
  assert.equal(guests.find((entry) => entry._id === id)?.email, "");
  const all = (await operation(read, {}, admin)).data?.getBookings as Array<{ _id: string; email: string }>;
  assert.equal(all.find((entry) => entry._id === id)?.email, "owner@example.test");
  assert.equal((await operation(remove, { id }, admin)).data?.deleteBooking, true);
});
