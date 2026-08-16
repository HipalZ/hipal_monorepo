import { connectDB } from "@hi/utils";
import { startCheckoutTaskSweeper } from "./queues/checkoutTaskSweeper";
import { startHotelNotificationSweeper } from "./queues/hotelNotificationSweeper";
import { prometheus } from "@hono/prometheus";
import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { rateLimiter } from "hono-rate-limiter";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { catchErrorHandler } from "../middleware/catchErrorHandler";
import { routes } from "./routes";
import { customTimeoutException } from "./utils";

import "./utils/env";
////////
const app = new Hono({
  strict: true,
});

// app.use(checkOrigin());

const limiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // 100 requests per minute
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("authorization") ?? "new-user",
  // store: new RedisStore({ client: redisClient }),
});
// // Apply the rate limiting middleware to all requests.
app.use(limiter);

const { printMetrics, registerMetrics } = prometheus();

app.use("*", registerMetrics);
app.get("/metrics", printMetrics);
app.use(timeout(1800000, customTimeoutException));
app.use(secureHeaders());
app.use(prettyJSON());

// Single source of truth for trusted frontend origins. Both CORS and CSRF use
// this list so they stay in sync (mismatches caused silent CSRF rejections).
const ALLOWED_ORIGINS = [
  "capacitor://localhost",
  "https://table.test.hipalz.com",
  "https://localhost/",
  "https://localhost",
  "https://biz.test.hipalz.com",
  "https://hipal-test.hipalz.com",
  "https://hipalz.com",
  "https://hibiz.hipalz.com",
  "https://hiclient.hipalz.com",
  "https://www.table.test.hipalz.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3004",
  "https://www.biz.test.hipalz.com",
  "https://www.hipal-test.hipalz.com",
  "https://www.hipalz.com",
  "https://www.hibiz.hipalz.com",
  "https://www.hiclient.hipalz.com",
];

app.use(
  "*",
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true,
    allowHeaders: ["Authorization", "Content-Type", "x-refresh-token"],
  }),
);
// CSRF middleware compares the request's Origin against the allowed list. By
// default (no options) it only allows same-origin POSTs, which silently kills
// every cross-origin request from our frontends — that's what was causing the
// empty 400 on /whatsapp/media-upload.
app.use(csrf({ origin: ALLOWED_ORIGINS }));
app.use(logger());
// app.use("*", tokenVerification);
app.use("/assets/*", serveStatic({ path: "./assets" }));
app.get("/ui", swaggerUI({ url: "/doc" }));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

(async () => {
  await connectDB();
  // Escalation for room-checkout tasks. Sweeps the DB, so it recovers whatever
  // was pending if the process restarts mid-window.
  startCheckoutTaskSweeper();
  startHotelNotificationSweeper();
})();

app.route("/", routes);

app.get("/", async (c) => {
  return c.json({
    message: `Hipalz Backend RPC Server with Environment:${Bun.env.NODE_ENV}`,
    data: {
      pid: process.pid,
    },
  });
});

export default {
  port: Bun.env.PORT,
  fetch: app.fetch,
};

//@ts-ignore
app.use(catchErrorHandler(app));

export { type AppType } from "./routes";
