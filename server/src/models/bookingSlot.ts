const studioClock = new Intl.DateTimeFormat("en-GB", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function studioParts(timestamp: number) {
  const parts = Object.fromEntries(
    studioClock.formatToParts(timestamp).map(({ type, value }) => [type, value]),
  );
  return { day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

function isCalendarDay(day: string) {
  const timestamp = Date.parse(`${day}T00:00:00Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === day;
}

function parseDay(value: string) {
  const raw = value.trim();
  const day = /^(\d{4}-\d{2}-\d{2})(?:$|T)/.exec(raw)?.[1];
  if (day && !isCalendarDay(day)) throw new Error("Invalid appointment date or time");
  if (day === raw) return day;

  // The old calendar sent epoch milliseconds. Also support legacy ISO instants
  // with an explicit offset. A date without a time is a studio calendar day.
  const timestamp = /^\d{13}$/.test(raw)
    ? Number(raw)
    : day && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(raw)
      ? Date.parse(raw)
      : NaN;
  if (!Number.isFinite(timestamp)) throw new Error("Invalid appointment date or time");
  return studioParts(timestamp).day;
}

function studioTimestamp(day: string, time: string) {
  const wallTime = Date.parse(`${day}T${time}:00Z`);
  // Try the offsets on both sides of the target day. Pick the earlier instant
  // when the clock repeats and reject a skipped wall time during spring DST.
  for (const probe of [wallTime - 12 * 3_600_000, wallTime + 12 * 3_600_000]) {
    const displayed = studioParts(probe);
    const offset = Date.parse(`${displayed.day}T${displayed.time}:00Z`) - probe;
    const candidate = wallTime - offset;
    const actual = studioParts(candidate);
    if (actual.day === day && actual.time === time) return candidate;
  }
  throw new Error("Invalid appointment date or time");
}

export function normalizeBookingSlot(rawDate: string, rawTime: string) {
  const day = parseDay(rawDate);
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(rawTime.trim());
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new Error("Invalid appointment date or time");
  }
  const time = `${match[1].padStart(2, "0")}:${match[2].padStart(2, "0")}`;
  return {
    date: String(studioTimestamp(day, "00:00")),
    time,
    startsAt: studioTimestamp(day, time),
  };
}

export function validateFutureBookingSlot(date: string, time: string) {
  const { startsAt, ...slot } = normalizeBookingSlot(date, time);
  if (startsAt <= Date.now()) throw new Error("Cannot book a past time");
  return slot;
}
