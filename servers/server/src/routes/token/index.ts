import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
//@ts-ignore
import { z } from "zod";
import { respond } from "../../utils/response";

//
const tokenRouter = new Hono().post(
  "/push",
  zValidator(
    "json",
    z.object({
      set: z.boolean().default(false),
    }),
  ),
  async (c) => {
    const { set } = await c.req.json();

    return respond(c, "Token generated successfully", false, 200, {});
  },
);

export default tokenRouter;
