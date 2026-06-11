// v2: blast-window campaign filtering lives in services/scanAudit.ts.
// NOTE: that file is outside src/queues/**, so the worker CI trigger in
// publish-worker-prod.yml does not see changes to it — bump this file
// whenever the audit logic changes to force a worker image rebuild.
import type { Job } from "bullmq";
import {
  runScanAudit,
  runVisitBackfill,
  ScanAuditResult,
} from "../../../services/scanAudit";
import type { ScanAuditJobTypes } from "../../types/jobtypes";

// Marks the result doc so /scan_audit/result surfaces failures instead
// of staying RUNNING forever. attempts: 1 — no retry loop.
function withErrorMarking(
  fn: (jobDocId: string, businessId: string, limit?: number) => Promise<void>,
) {
  return async (job: Job) => {
    const { jobDocId, businessId, limit } =
      job.data as ScanAuditJobTypes["backfillVisits"];
    try {
      await fn(jobDocId, businessId, limit);
    } catch (err) {
      await ScanAuditResult.updateOne(
        { _id: jobDocId },
        {
          $set: {
            status: "ERROR",
            error: err instanceof Error ? err.message : String(err),
            finishedAt: Date.now(),
          },
        },
      );
      throw err;
    }
  };
}

export const scanAuditHandlers = {
  runScanAudit: withErrorMarking(runScanAudit),
  backfillVisits: withErrorMarking(runVisitBackfill),
};
