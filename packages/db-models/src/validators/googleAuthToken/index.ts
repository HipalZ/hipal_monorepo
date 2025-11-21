import { z } from "zod";

/* -------------------------
   🎯 TOKEN STORAGE VALIDATOR
----------------------------*/
export const GoogleAuthTokenValidator = z.object({
  businessId: z.string().trim().min(1, "businessId missing"),
  sessionKey: z.string().trim().min(1, "sessionKey missing"),
  chatbotId: z.string().trim().optional(),

  googleEmail: z.string().email().optional(),

  access_token: z.string().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
  expiry_date: z.number().optional(),
});

/* -------------------------
   🎯 STATUS CHECK VALIDATOR
----------------------------*/
export const GoogleAuthStatusValidator = z.object({
  businessId: z.string().trim().min(1, "businessId missing"),
  sessionKey: z.string().trim().min(1, "sessionKey missing"),
  chatbotId: z.string().optional(),
});

/* -------------------------
   🎯 APPEND TO SHEET VALIDATOR
----------------------------*/
export const GoogleSheetSubmitValidator = z.object({
  businessId: z.string().trim().min(1, "businessId missing"),
  sessionKey: z.string().trim().min(1, "sessionKey missing"),
  chatbotId: z.string().optional(),

  spreadsheetId: z.string().trim().min(1, "spreadsheetId missing"),
  range: z.string().optional(),

  values: z
    .array(z.array(z.any()))
    .min(1, "values cannot be empty (must contain at least 1 row)"),
});

export type GoogleAuthTokenType = z.infer<typeof GoogleAuthTokenValidator>;
export type GoogleAuthStatusType = z.infer<typeof GoogleAuthStatusValidator>;
export type GoogleSheetSubmitType = z.infer<typeof GoogleSheetSubmitValidator>;
