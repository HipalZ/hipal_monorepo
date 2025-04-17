import type { Context, Next } from "hono";

export enum ClientRoles {
  HIPAL_ADMIN = "HIPAL_ADMIN",
  HIPAL_CUSTOMER = "HIPAL_CUSTOMER",
  OWNER = "OWNER",
  CO_OWNER = "CO_OWNER",
  MANAGER = "MANAGER",
  CAPTAIN = "CAPTAIN",
  MARKETING_AGENT = "MARKETING_AGENT",
}

// ! Assumes we are going to call tokenvalidator Client before this middleware

export const requireAuthorization = (roles: ClientRoles[]) => {
  const checkAuthorization = async (c: Context, next: Next) => {
    const origins = [
      "https://hipalz.com",
      "https://hipal-test.hipalz.com",
      "https://biz.test.hipalz.com",
      "https://hibiz.hipalz.com",
      "https://table.test.hipalz.com",
      "https://hiclient.hipalz.com",
    ];
    // if (!origins.includes(c.req.header("Origin") || "")) {
    //   return c.json({ message: "Access Denied!" }, 401);
    // }

    // const currentUser = c.get("current_user");

    // if (!currentUser) {
    //   return c.json({ message: "Not Authorized" }, 401);
    // }

    // const exists = roles.includes(currentUser.role as ClientRoles);
    // if (!exists) {
    //   return c.json({ message: "Access Denied!" }, 401);
    // }

    const currentUser = c.get("current_user");

    if (!currentUser) {
      return c.json({ message: "Not Authorized" }, 401);
    }

    const exists = roles.includes(currentUser.role as ClientRoles);
    if (!exists) {
      return c.json({ message: "Access Denied!" }, 401);
    }

    await next();
  };
  return checkAuthorization;
};
