import { User } from "@hi/db-models";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { JwtPayload } from "jsonwebtoken";
//@ts-ignore
import jwt from "jsonwebtoken";
import { respond } from "../src/utils/response";

interface DecodedToken extends JwtPayload {
  id: string;
  permissions: Record<string, boolean>; // Ensure this is a proper object type
}

export const ubacMiddleware = (key: string) => {
  return async (c: Context, next: Next) => {
    try {
      const token = getCookie(c, "token");

      let decodedToken: DecodedToken;

      if (token) {
        try {
          decodedToken = jwt.verify(token, Bun.env.JWT_SECRET) as DecodedToken;
        } catch (err) {
          return c.json(
            { status: false, error: true, message: "Invalid Token!" },
            401,
          );
        }

        if (
          Object.keys(decodedToken.permissions).length !== 0 && // Check if the object has at least one key
          (!Object.prototype.hasOwnProperty.call(
            decodedToken.permissions,
            key,
          ) ||
            !decodedToken.permissions[key])
        ) {
          return c.json({ message: "access denied", data: {}, err: true }, 403);
        }

        const staffData = await User.findOne(
          {
            _id: decodedToken.id,
            "customRole.businessId": decodedToken.businessId,
            "customRole.isDeleted": false,
          },
          {
            name: 1,
            phone: 1,
            customRole: {
              $elemMatch: {
                businessId: decodedToken.businessId,
                isDeleted: false,
              },
            },
          },
        ).lean();

        if (!staffData) {
          return respond(c, "access denied", true, 403, {});
        }
      }

      await next();
    } catch (error) {
      console.error("Middleware error:", error);
      return c.json({ message: "access denied", data: {}, err: true }, 403);
    }
  };
};
