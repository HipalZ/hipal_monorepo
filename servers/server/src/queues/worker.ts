import type { Job } from "bullmq";
import { Worker } from "bullmq";
import { redis } from "./connection";
import { QUEUE_NAME, type QueueName } from "./constants/queueNames";

import connectDB from "./dbConnection";
import { handlers } from "./handlers";

async function jobHandler(job: Job) {
  console.log("📝 Job received:", job.name);

  const queueHandlers = handlers[job.queueName as QueueName];
  console.log("queueHandlers", queueHandlers);
  const handler = queueHandlers?.[job.name as keyof typeof queueHandlers];

  if (!handler) throw new Error(`No handler for ${job.queueName}:${job.name}`);
  return handler(job);
}

function createWorker(
  queueName: QueueName,
  concurrency: number,
  withLimiter = false,
) {
  const worker = new Worker(queueName, jobHandler, {
    connection: redis,
    concurrency,
    lockDuration: 300_000,
    ...(withLimiter && {
      limiter: {
        max: 2, // 20 jobs
        duration: 2000, // per second
      },
    }),
  });

  worker.on("active", (job) =>
    console.log(`[${queueName}] ▶️ active ${job.name} #${job.id}`),
  );
  worker.on("completed", (job) =>
    console.log(`[${queueName}] ✅ completed ${job.name} #${job.id}`),
  );
  worker.on("failed", async (job, err) => {
    console.error(
      `[${queueName}] ❌ failed ${job?.name} #${job?.id}`,
      err.message,
    );
    if (job && job.attemptsMade >= (job.opts.attempts ?? 1)) {
      // await pushToDLQ(job);
    }
  });
}
(async () => {
  await connectDB();
})();

console.log("🚀 Unified worker started");
createWorker(QUEUE_NAME.BILL_QUEUE, 2); // normal worker
createWorker(QUEUE_NAME.WHATSAPP_CAMPAIGN_QUEUE, 5, true); // worker with rate limiting
