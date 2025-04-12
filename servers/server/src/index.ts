import { connectDB } from "@hi/utils";
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
import * as client from "prom-client"; // Import prom-client for custom metrics
import { catchErrorHandler } from "../middleware/catchErrorHandler";
import { routes } from "./routes";
import { customTimeoutException } from "./utils";

import "./utils/env";

// Collect default metrics (Node.js, process, etc.)
client.collectDefaultMetrics();

// Create a counter for HTTP requests.
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests received by the application",
  labelNames: ["method", "route", "status_code"],
});

// Create a histogram for HTTP request durations (in seconds).
const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
});

// Create the Hono app.
const app = new Hono({
  strict: true,
});

// Rate limiting middleware
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10000,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("authorization") ?? "new-user",
});
app.use(limiter);

// Custom middleware: Measure each request's duration and update custom metrics.
app.use("*", async (c, next) => {
  // Start timer using process.hrtime
  const start = process.hrtime();

  // Process the request
  await next();

  // When the response is finished, record metrics.
  const diff = process.hrtime(start);
  const durationSeconds = diff[0] + diff[1] / 1e9;

  // Use the request URL as "route". For a more robust solution, you could extract a defined route.
  const route = c.req.url;
  const method = c.req.method;
  // Use c.res.status if available; default to 200 if not set.
  const status_code = c.res.status || 200;

  // Increment the counter and record the duration in the histogram.
  httpRequestsTotal.inc({ method, route, status_code });
  httpRequestDurationSeconds.observe(
    { method, route, status_code },
    durationSeconds,
  );
});

// Expose the metrics endpoint using the default registry from prom-client.
app.get("/metrics", async (c) => {
  c.header("Content-Type", client.register.contentType);
  return c.text(await client.register.metrics());
});

// --- Other middlewares and configuration ---
app.use(timeout(+Bun.env.TIMEOUT, customTimeoutException));
app.use(secureHeaders());
app.use(prettyJSON());
app.use(
  "*",
  cors({
    origin: [
      "https://table.test.hipalz.com",
      "https://2418-2401-4900-1cb4-8ea0-f802-33e4-64bd-3ab9.ngrok-free.app",
      "http://localhost:5173",
      "http://localhost:3001",
      "http://localhost:3000",
      "http://localhost:3002",
      "https://biz.test.hipalz.com",
      "https://hipal-test.hipalz.com",
      "https://hipalz.com",
      "https://hibiz.hipalz.com",
      "https://hiclient.hipalz.com",
    ],
    credentials: true,
    allowHeaders: ["Authorization", "Content-Type", "x-refresh-token"],
  }),
);
app.use(csrf());
app.use(logger());
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
