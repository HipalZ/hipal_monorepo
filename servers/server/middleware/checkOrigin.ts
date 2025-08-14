import type { Context, Next } from "hono";

export const checkOrigin = () => {
  const origin = async (c: Context, next: Next) => {
    const origins = [
      "https://hipalz.com",
      "https://hipal-test.hipalz.com",
      "https://biz.test.hipalz.com",
      "https://hibiz.hipalz.com",
      "https://table.test.hipalz.com",
      "https://hiclient.hipalz.com",
      "http://localhost:5173",
      "http://localhost:5174",

      "http://localhost:3001",
      "http://localhost:3000",
      "https://www.hipalz.com",
      "https://www.hipal-test.hipalz.com",
      "https://www.biz.test.hipalz.com",
      "https://www.hibiz.hipalz.com",
      "https://www.table.test.hipalz.com",
      "https://www.hiclient.hipalz.com",
    ];

    const headerData = c.req.header();

    if (headerData?.host === "localhost:4500") {
      return await next();
    }

    if (!origins.includes(c.req.header("Origin") || "")) {
      return c.json({ message: "Access Denied!" }, 401);
    }

    await next();
  };
  return origin;
};
