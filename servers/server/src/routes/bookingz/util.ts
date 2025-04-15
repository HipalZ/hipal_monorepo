import type { Context } from "hono";
import { ApiResponse } from "../../utils/ApiResponse";

export const fn = async (c: Context) => {
  console.log("running????");

  return c.json(new ApiResponse(201, "running????", "ran successfully."));
};
