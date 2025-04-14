import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

import type { JwtPayload } from "jsonwebtoken";
//@ts-ignore
import jwt from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  id: string;
}

export const authTokenValidator = async (c: Context, next: Next) => {
  const token = getCookie(c, "token");

  let decodedToken: DecodedToken | undefined;

  try {
    if (!token) {
      return c.json({ message: "Not Authorized" }, 401);
    }
    decodedToken = jwt.verify(
      token,
      Bun.env.JWT_SECRET as string,
    ) as unknown as DecodedToken;
  } catch (error) {
    console.log("Error verifying token", error);
    return c.json({ message: "Not Authorized" }, 401);
  }
  if (!decodedToken) {
    return c.json({ message: "Not Authorized" }, 401);
  }

  console.log("decodedToken", decodedToken);

  c.set("current_user", decodedToken);

  await next();
};
