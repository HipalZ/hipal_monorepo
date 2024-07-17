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

    console.error(err);
    return c.json(
      {
        errors: " Something went wrong",
        CustomError: false,
        message: err.message,
        data: {},
      },
      400,
    );
  });
};
