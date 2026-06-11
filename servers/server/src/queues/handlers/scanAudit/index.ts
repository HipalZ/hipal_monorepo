import type { Job } from "bullmq";
import { runScanAudit, ScanAuditResult } from "../../../services/scanAudit";
import type { ScanAuditJobTypes } from "../../types/jobtypes";

async function runScanAuditHandler(job: Job) {
  const { jobDocId, businessId } =
    job.data as ScanAuditJobTypes["runScanAudit"];

  try {
    await runScanAudit(jobDocId, businessId);
  } catch (err) {
    // Mark the result doc so /scan_audit/result surfaces the failure
    // instead of staying RUNNING forever. attempts: 1 — no retry loop.
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
}

export const scanAuditHandlers = {
  runScanAudit: runScanAuditHandler,
};
