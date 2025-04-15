import { Types } from "mongoose";
import { createHash } from "node:crypto";
import { isEqual } from "lodash";

/** ─────────── Time helpers ─────────── */
export const parseTimeToMinutes = (t: string): number =>
  parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(3, 5), 10);

export const formatMinutes = (m: number): string =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(
    2,
    "0",
  )}`;

export const inClosedInterval = (
  dayCfg: { closedIntervals: { startTime: string; endTime: string }[] },
  slot: string,
) => {
  const m = parseTimeToMinutes(slot);
  return dayCfg.closedIntervals.some(
    (ci) =>
      parseTimeToMinutes(ci.startTime) <= m &&
      m < parseTimeToMinutes(ci.endTime),
  );
};

/** ─────────── Period helpers ─────────── */
export const derivePeriod = (slot: string): 0 | 1 | 2 | 3 => {
  const m = parseTimeToMinutes(slot);
  if (m >= 240 && m < 720) return 0;
  if (m >= 720 && m < 960) return 1;
  if (m >= 960 && m < 1140) return 2;
  if (m >= 1140 && m <= 1680) return 3;
  throw new Error(`Slot ${slot} not in any period`);
};

/** ─────────── ID / QR helpers ─────────── */
export const generateUniqueVersionId = () => new Types.ObjectId().toHexString();

export const generateQRCode = (bookingId: string) =>
  Buffer.from(`https://hipalz.app/b/${bookingId}`).toString("base64");

export const generateUniqueCode = (bookingId: string) =>
  createHash("sha1")
    .update(bookingId + Date.now().toString())
    .digest("hex");

/** ─────────── Deep‑equal (for ledger diff) ─────────── */
export const deepEqual = isEqual;
