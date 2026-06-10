import { connectDB } from "@hi/utils";
import { prometheus } from "@hono/prometheus";
import { swaggerUI } from "@hono/swagger-ui";
import axios from "axios";
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
import {
  META_PAUSED_MESSAGE,
  WHATSAPP_META_PAUSED,
} from "./utils/whatsAppApiBaseUrl/apiPaths";

import "./utils/env";

// ─── META API GLOBAL SAFETY NET ────────────────────────────────────────────
// While the Meta WhatsApp account is under review (see WHATSAPP_META_PAUSED
// in utils/whatsAppApiBaseUrl/apiPaths.ts), reject every axios request that
// targets graph.facebook.com BEFORE the network call goes out. This catches
// any code path the per-route guards missed — uploads, webhook callbacks,
// analytics, chatbot replies, anything.
//
// Removing this interceptor: flip WHATSAPP_META_PAUSED back to false.
if (WHATSAPP_META_PAUSED) {
  axios.interceptors.request.use((config) => {
    const url = (config.url || "") + (config.baseURL || "");
    if (/graph\.facebook\.com/i.test(url)) {
      const err: Error & { code?: string; isMetaPause?: boolean } = new Error(
        META_PAUSED_MESSAGE,
      );
      err.code = "WHATSAPP_META_PAUSED";
      err.isMetaPause = true;
      return Promise.reject(err);
    }
    return config;
  });
  console.warn(
    "[startup] WHATSAPP_META_PAUSED is ON — all graph.facebook.com requests will be rejected.",
  );
}
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
