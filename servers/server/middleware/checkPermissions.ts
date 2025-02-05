import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { JwtPayload } from "jsonwebtoken";
//@ts-ignore
import jwt from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  id: string;
  permissions: Record<string, boolean>; // Ensure this is a proper object type
}

export const ubacMiddleware = (key: string) => {
  return async (c: Context, next: Next) => {
    try {
      const token = getCookie(c, "token");

      if (!token) {
        return c.json({ message: "Not Authorized" }, 401);
      }

      let decodedToken: DecodedToken;

      try {
        decodedToken = jwt.verify(token, Bun.env.JWT_SECRET) as DecodedToken;
      } catch (err) {
        return c.json(
          { status: false, error: true, message: "Invalid Token!" },
          401,
        );
      }

      if (!decodedToken || !decodedToken.permissions) {
        return c.json({ message: "Not Authorized" }, 401);
      }

      console.log("permissions", decodedToken.permissions);

      if (
        !Object.prototype.hasOwnProperty.call(decodedToken.permissions, key) ||
        !decodedToken.permissions[key]
      ) {
        return c.json({ message: "Not Authorized" }, 401);
      }

      await next();
    } catch (error) {
      console.error("Middleware error:", error);
      return c.json({ message: "Not Authorized" }, 401);
    }
  };
};
