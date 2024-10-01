import type { Context, Next } from "hono";

export const originAuthenticator = () => {
  const checkAuthorization = async (c: Context, next: Next) => {
    const origins = [
      "https://hipalz.com",
      "https://hipal-test.hipalz.com",
      "https://biz.test.hipalz.com",
      "https://hibiz.hipalz.com",
      "https://table.test.hipalz.com",
      "https://hiclient.hipalz.com",
    ];
    if (!origins.includes(c.req.header("Origin") || "")) {
      return c.json({ message: "Access Denied!" }, 401);
    }

    await next();
  };
  return checkAuthorization;
};
