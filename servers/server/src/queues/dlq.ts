import type { Job } from "bullmq";
import { Queue } from "bullmq";
import { redis } from "./connection";

const DLQ_NAME = "deadLetterQueue";
let dlq: Queue | null = null;

function getDLQ() {
  return (dlq ??= new Queue(DLQ_NAME, { connection: redis }));
}

export async function pushToDLQ(job: Job) {
  try {
    await getDLQ().add(
      job.name,
      {
        original: job.data,
        failedReason: job.failedReason,
        attemptsMade: job.attemptsMade,
      },
      { removeOnComplete: false },
    );

    console.warn(`[DLQ] 🚨 moved to DLQ: ${job.name} #${job.id}`);
  } catch (err: unknown) {
    console.error("[DLQ] push failed:", (err as Error).message);
  }
}
