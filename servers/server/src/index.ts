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

// Create a registry and collect default metrics
const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

// Create custom metrics, explicitly adding them to the registry
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests received by the application",
  labelNames: ["method", "route", "status_code"],
  registers: [registry],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.3, 0.5, 1, 2, 5],
  registers: [registry],
});

const app = new Hono({ strict: true });

// Rate limiting middleware
const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10000,
  standardHeaders: "draft-6",
  keyGenerator: (c) => c.req.header("authorization") ?? "new-user",
});
app.use(limiter);

// Custom middleware to record metrics for each request
app.use("*", async (c, next) => {
  const start = process.hrtime();
  await next();
  const diff = process.hrtime(start);
  const durationSeconds = diff[0] + diff[1] / 1e9;
  const route = c.req.url;
  const method = c.req.method;
  const status_code = c.res.status || 200;

  // For debugging, you can log:
  // console.log(`Recording metrics for ${method} ${route}: ${durationSeconds}s`);

  httpRequestsTotal.inc({ method, route, status_code });
  httpRequestDurationSeconds.observe(
    { method, route, status_code },
    durationSeconds,
  );
});

// Expose the metrics endpoint using our registry
app.get("/metrics", async (c) => {
  c.header("Content-Type", registry.contentType);
  return c.text(await registry.metrics());
});

// Other middlewares and routes
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
    data: { pid: process.pid },
  });
});

export default {
  port: Bun.env.PORT,
  fetch: app.fetch,
};
//@ts-ignore
app.use(catchErrorHandler(app));

export { type AppType } from "./routes";
