import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
//@ts-ignore
import jwt from "jsonwebtoken";
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

    const api_token = jwt.sign(
      {
        hipalz_id: 1,
      },
      "014f6bc236f2ba1cc2c85cb4a7e723ac7fb46fcc5cbd41c382cdf5495eb72d34",
    );

    setCookie(c, "api_token", api_token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return respond(c, "Token generated successfully", false, 200, {});
  },
);

export default tokenRouter;
