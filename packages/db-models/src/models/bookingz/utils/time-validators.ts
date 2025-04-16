import { z } from "zod";

/**
 * Converts "HH:mm" string to total minutes since 00:00.
 */

/**
 * Converts minutes back to "HH:mm" format.
 */
export const formatMinutes = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

/**
 * Reusable time string validator: checks format + range
 */
export const timeInRangeValidator = (
  label: string,
  minMinutes: number,
  maxMinutes: number,
) =>
  z
    .string()
    .regex(/^([0-2]?\d):([0-5]\d)$/, `${label} must be in HH:mm format`)
    .refine(
      (val) => {
        const total = parseTimeToMinutes(val);
        return total >= minMinutes && total <= maxMinutes;
      },
      {
        message: `${label} must be between ${formatMinutes(
          minMinutes,
        )} and ${formatMinutes(maxMinutes)}`,
      },
    );

export const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};
