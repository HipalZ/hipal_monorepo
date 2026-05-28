// catchErrorHandler.ts
import type { Hono } from "hono";
import { CustomError } from "./customError";

export const catchErrorHandler = (app: Hono) => {
  app.onError(async (err: any, c) => {
    // Always log so server-side debugging never relies on the response shape.
    console.error("[onError]", {
      url: c.req.url,
      method: c.req.method,
      name: err?.name,
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    });

    if (err instanceof CustomError) {
      return c.json(
        {
          errors: err.serializeErrors(),
          CustomError: true,
          message: err.message,
          data: {},
        },
        400,
      );
    }

    // Fallback: never return a blank message. Compose something useful from
    // whatever the error carries (name, code, stack) so clients can debug.
    const composedMessage =
      err?.message ||
      err?.code ||
      err?.name ||
      (typeof err === "string" ? err : "") ||
      "Unknown server error";

    return c.json(
      {
        err: true,
        CustomError: true,
        message: composedMessage,
        // Surface the error name/code separately so the frontend extractor
        // (extractTemplateError) and humans both see useful info.
        errorName: err?.name,
        errorCode: err?.code,
        stack:
          process.env.NODE_ENV === "production" ? undefined : err?.stack,
        data: {},
      },
      400,
    );
  });
};
