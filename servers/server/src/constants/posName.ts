import { z } from "zod";

export const POS_NAME = {
  PETPOOJA: "PETPOOJA",
  HIPAL_Z: "HIPAL_Z",
} as const;

export const posNamesEnum = z.enum([POS_NAME.PETPOOJA, POS_NAME.HIPAL_Z]);
export type PosName = z.infer<typeof posNamesEnum>;
