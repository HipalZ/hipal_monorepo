/**
 * DB-free self-check for the occupancy predicate.
 * Run:  bun run src/utils/requireRoomOccupancy.check.ts
 */
import assert from "node:assert";
import { isCurrentOccupant } from "./requireRoomOccupancy";

// checked-in guest is an occupant
assert.equal(
  isCurrentOccupant({ roomStatus: "OCCUPIED", userIds: ["u1"] }, "u1"),
  true,
);
// companion (multiple ids) is an occupant
assert.equal(
  isCurrentOccupant({ roomStatus: "OCCUPIED", userIds: ["u1", "u2"] }, "u2"),
  true,
);
// ObjectId vs string is compared by value
assert.equal(
  isCurrentOccupant(
    { roomStatus: "OCCUPIED", userIds: [{ toString: () => "u1" }] },
    "u1",
  ),
  true,
);
// user not in the room -> expelled
assert.equal(
  isCurrentOccupant({ roomStatus: "OCCUPIED", userIds: ["u1"] }, "ghost"),
  false,
);
// after checkout: userIds emptied -> expelled (the stale-link case)
assert.equal(isCurrentOccupant({ roomStatus: "AVAILABLE", userIds: [] }, "u1"), false);
// room occupied by a NEW guest today; old guest's id absent -> expelled
assert.equal(
  isCurrentOccupant({ roomStatus: "OCCUPIED", userIds: ["newGuest"] }, "oldGuest"),
  false,
);
// missing room / missing fields -> expelled
assert.equal(isCurrentOccupant(null, "u1"), false);
assert.equal(isCurrentOccupant({ userIds: ["u1"] }, "u1"), false); // no OCCUPIED status

console.log("requireRoomOccupancy: all occupancy checks passed ✅");
