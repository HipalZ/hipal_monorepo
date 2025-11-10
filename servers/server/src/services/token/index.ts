import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import jwt from "jsonwebtoken";

const pushToken = async (c: Context) => {
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

  return api_token;
};

export { pushToken };
