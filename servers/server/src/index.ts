import { connectDB } from "@hi/utils";
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
import { razorpayWrapper } from "../razorpay_wrapper";
import { routes } from "./routes";
import { customTimeoutException } from "./utils";

import "./utils/env";

const app = new Hono({
  strict: true,
});

razorpayWrapper.create(Bun.env.RAZORPAY_KEY_ID, Bun.env.RAZORPAY_SECRET);

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 5000,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("authorization") ?? "new-user",
  // store: new RedisStore({ client: redisClient }),
});
// // Apply the rate limiting middleware to all requests.
app.use(limiter);

const { printMetrics, registerMetrics } = prometheus();

app.use("*", registerMetrics);
app.get("/metrics", printMetrics);
app.use(timeout(+Bun.env.TIMEOUT, customTimeoutException));
app.use(secureHeaders());
app.use(prettyJSON());
app.use(cors());
app.use(csrf());
app.use(logger());
app.use("/assets/*", serveStatic({ path: "./assets" }));
app.get("/ui", swaggerUI({ url: "/doc" }));
app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

(async () => {
  await connectDB();
})();
//
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

app.use(catchErrorHandler(app));

export { type AppType } from "./routes";
