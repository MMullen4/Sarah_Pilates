import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeBookingSlot, validateFutureBookingSlot } from "../src/models/bookingSlot.js";

test("date-only, legacy milliseconds and ISO instants normalize to the same studio slot", () => {
  const expected = {
    date: String(Date.parse("2035-07-14T07:00:00Z")),
    time: "08:00",
    startsAt: Date.parse("2035-07-14T15:00:00Z"),
  };
  assert.deepEqual(normalizeBookingSlot(" 2035-07-14 ", "8:0"), expected);
  assert.deepEqual(normalizeBookingSlot(expected.date, "08:00"), expected);
  assert.deepEqual(normalizeBookingSlot("2035-07-14T17:40:00-07:00", " 8:00 "), expected);
});

test("rejects malformed input and handles Pacific daylight saving transitions", () => {
  for (const [day, time] of [
    ["2035-02-30", "08:00"], ["", "08:00"], ["2035-07-14", "08:00:00"],
    ["2035-07-14", "24:00"], ["2026-03-08", "02:30"],
  ]) {
    assert.throws(() => normalizeBookingSlot(day, time), /Invalid appointment/);
  }
  assert.equal(normalizeBookingSlot("2026-03-08", "08:00").startsAt, Date.parse("2026-03-08T15:00Z"));
  assert.equal(normalizeBookingSlot("2026-11-01", "01:30").startsAt, Date.parse("2026-11-01T08:30Z"));
  assert.throws(() => validateFutureBookingSlot("2000-01-01", "08:00"), /past time/);
});
