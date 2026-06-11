import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import Papa from "papaparse";
import { z } from "zod";
import { enqueueScanAuditJob } from "../../queues/enqueue";
import { ScanAuditResult } from "../../services/scanAudit";
import { respond } from "../../utils/response";

// Temporary read-only diagnostic to reconstruct historical scan/visit
// data from WhatsApp delivery-status receipts. /start enqueues a BullMQ
// job (processed by the worker); /result is an instant read of the
// persisted output — no request ever runs long enough to hit a gateway
// timeout. Remove this route after the backfill is complete.
const AUDIT_KEY = "hipal-scan-audit-2026";

const queryValidator = zValidator(
  "query",
  z.object({
    businessId: z.string().min(2).max(50),
    key: z.string().min(1),
    mode: z.enum(["summary", "full", "csv"]).optional(),
  }),
);

const scanAuditRouter = new Hono()
  // Enqueue the audit. Returns immediately with the result-doc id.
  .get("/start", queryValidator, async (c) => {
    const { businessId, key } = c.req.query();
    if (key !== AUDIT_KEY) {
      return respond(c, "Invalid audit key", true, 401, {});
    }

    const existing = await ScanAuditResult.findOne({
      businessId,
      status: { $in: ["QUEUED", "RUNNING"] },
    });
    if (existing) {
      return respond(c, "Audit already in progress", false, 200, {
        jobId: existing._id,
        status: existing.status,
        startedAt: existing.startedAt,
      });
    }

    const jobDoc = await ScanAuditResult.create({
      businessId,
      status: "QUEUED",
      startedAt: Date.now(),
    });

    await enqueueScanAuditJob("runScanAudit", {
      jobDocId: String(jobDoc._id),
      businessId,
    });

    return respond(
      c,
      "Audit queued — poll /scan_audit/result in a few minutes",
      false,
      200,
      { jobId: jobDoc._id },
    );
  })

  // Read the latest result. Instant — no heavy work here.
  .get("/result", queryValidator, async (c) => {
    const { businessId, key, mode = "summary" } = c.req.query();
    if (key !== AUDIT_KEY) {
      return respond(c, "Invalid audit key", true, 401, {});
    }

    const job = await ScanAuditResult.findOne({ businessId })
      .sort({ startedAt: -1 })
      .lean();

    if (!job) {
      return respond(
        c,
        "No audit found — call /scan_audit/start first",
        true,
        404,
        {},
      );
    }
    if (job.status === "QUEUED" || job.status === "RUNNING") {
      return respond(c, "Audit in progress — retry shortly", false, 202, {
        status: job.status,
        startedAt: job.startedAt,
      });
    }
    if (job.status === "ERROR") {
      return respond(c, "Audit failed", true, 500, { error: job.error });
    }

    const customers = (job.customers ?? []) as Array<Record<string, unknown>>;

    if (mode === "csv") {
      const csvString = Papa.unparse(customers, {
        header: true,
        quotes: true,
        skipEmptyLines: true,
      });
      c.header("Content-Type", "text/csv");
      c.header(
        "Content-Disposition",
        `attachment; filename="scan_audit_${businessId}.csv"`,
      );
      return c.body(csvString);
    }

    return respond(c, "Scan audit result", false, 200, {
      status: job.status,
      startedAt: job.startedAt,
      finishedAt: job.finishedAt,
      statusSummary: job.statusSummary,
      totals: job.totals,
      sampleWamids: job.sampleWamids,
      customers: mode === "full" ? customers : customers.slice(0, 50),
    });
  });

export default scanAuditRouter;
