import { Hono, Context } from "hono";
import { CustomError } from "./CustomError"; // adjust import as needed
import { ApiError } from "@/utils/ApiError";
import { ZodError } from "zod";

export const catchErrorHandler = (app: Hono) => {
  app.onError(async (err, c: Context) => {
    // Create the advanced error details from the error.
    let advancedError: ApiError;

    if (err instanceof ApiError) {
      advancedError = err;
    } else if (err instanceof ZodError) {
      const errors = err.errors.map((issue: any) => ({
        field: issue.path.join("."),
        errorMessage: issue.message,
      }));
      advancedError = new ApiError(422, "Zod Error", errors, err?.stack || "");
    } else {
      const statusCode = (err as any)?.statusCode ?? 500;
      const message = err?.message ?? "Something went wrong";
      const errors = (err as any)?.errors ?? [];
      advancedError = new ApiError(
        statusCode,
        message,
        errors,
        err?.stack || "",
      );
    }

    // Format the advanced error data in a serializable way.
    const advancedErrorResponse = {
      message: advancedError.message,
      stack:
        process.env.NODE_ENV === "development"
          ? advancedError.stack
          : advancedError.stack,
      ...(advancedError.errors ? { errors: advancedError.errors } : {}),
      statusCode: advancedError.statusCode,
    };

    // Return the response with the advancedError field attached.
    if (err instanceof CustomError) {
      return c.json(
        {
          errors: err.serializeErrors(),
          CustomError: true,
          message: err.message,
          data: {},
          stack: err?.stack,
          advancedError: advancedErrorResponse, // added advanced error details
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
        stack: err?.stack,
        advancedError: advancedErrorResponse, // added advanced error details
      },
      400,
    );
  });
};
