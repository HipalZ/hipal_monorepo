// catchErrorHandler.ts
import type { Hono } from "hono";
import { CustomError } from "./customError";

export const catchErrorHandler = (app: Hono) => {
  app.onError(async (err, c) => {
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

    return c.json(
      {
        err: true,
        CustomError: true,
        message: err.message,
        data: {},
      },
      400,
    );
  });
};
