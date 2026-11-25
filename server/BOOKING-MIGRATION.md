# Booking slot migration

The GraphQL fields and mutations keep their existing types. The new calendar sends
a studio day as `YYYY-MM-DD`. The API also accepts legacy 13-digit epoch-millisecond
strings and ISO timestamps with an explicit offset. Stored dates and API responses
use epoch milliseconds at midnight in `America/Los_Angeles` as strings. Times use
`HH:mm`. Both create and edit reject slots that have already started.

## Rehearse locally

Use Node 22.12 or later and a disposable MongoDB instance. From the repository root:

```sh
npm ci --ignore-scripts
docker run --rm --name pilates-booking-test-mongo -p 127.0.0.1:27029:27017 mongo:7
```

Leave MongoDB running and use a second terminal:

```sh
BOOKING_TEST_MONGO_PORT=27029 npm test -w server
TZ=Pacific/Auckland npm test -w clean-sarahs-pilates-client
npm run typecheck -w server
npm exec -w clean-sarahs-pilates-client -- tsc --noEmit
```

The integration tests use a randomly named database on the loopback MongoDB
instance and remove that disposable test database. To rehearse on a restored
copy or initialize a separate local database for the application:

```sh
export BOOKING_MIGRATION_URI='mongodb://127.0.0.1:27029/pilates_booking_rehearsal'
npm run migrate:booking-slots -w server -- --check
npm run migrate:booking-slots -w server -- --apply
npm run migrate:booking-slots -w server -- --check
```

The last audit should report zero changes. The apply command verifies that the
unique `{ date: 1, time: 1 }` index exists. For local application smoke tests,
point `MONGODB_URI` at the migrated local database and use a local JWT secret.

## Requirements for a later rollout

1. Back up the bookings collection and rehearse on an isolated restore. Run
   `--check` there. It reports record IDs, proposed changes and blocking
   conflicts without updating records or creating the index.
2. Review the proposed mappings against existing confirmations. Legacy
   timestamps came from browser-local dates and carry no original timezone.
   Migration interprets each timestamp as an instant and uses its Pacific
   calendar day. A client outside Pacific time may have intended a different
   date. Use the confirmed date to correct the record in place before applying.
   ISO date-only values already express a calendar day.
3. Resolve malformed records and duplicate slot groups with Sarah using the
   existing appointment IDs. Correct formatting or a confirmed scheduling error
   in place. If two historical records genuinely refer to the same slot, pause
   for an explicit decision on preserving that history before proceeding.
   The migration assigns no replacement slot and never deletes appointments.
4. During an approved cutover, stop every booking writer, including instances
   of the old API. Take a fresh backup, repeat the audit and review new proposed
   changes, then apply the migration with an explicitly selected URI. Verify
   the resulting index and confirm the same record count and IDs against the
   snapshot before starting the new API and client. The new API requires the
   index at startup. Keep old API instances offline because they can still
   write alternative string formats.
5. If an apply attempt is interrupted, keep booking writers stopped and rerun
   the audit before retrying. The migration checks the original fields on each
   update and can resume over already normalized records. Keep the pre-cutover
   snapshot for any rollback. Roll back the client and server together because
   the older API expects numeric input.
