// src/queueClient.ts
import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "redis-14878.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 14878,
  password: "AzkxwkrnhjcsQGMdTz3AUk3tOxAsVC4I",
  maxRetriesPerRequest: null,
});

export const billQueue = new Queue("billQueue", {
  connection,
  defaultJobOptions: {
    attempts: 1, // only run once
    backoff: { type: "fixed", delay: 0 },
    removeOnComplete: { age: 50 }, // remove 50s after success
    removeOnFail: true, // remove immediately on failure
  },
});

// Broad‐scope event emitter for monitoring
export const billQueueEvents = new QueueEvents("billQueue", { connection });

billQueueEvents.on("waiting", ({ jobId }) =>
  console.log(`⏳ Job ${jobId} enqueued and waiting`),
);
billQueueEvents.on("active", ({ jobId }) =>
  console.log(`🚀 Job ${jobId} started processing`),
);
billQueueEvents.on("completed", ({ jobId, returnvalue }) =>
  console.log(`✅ Job ${jobId} completed, return=${returnvalue}`),
);
billQueueEvents.on("failed", ({ jobId, failedReason }) =>
  console.log(`❌ Job ${jobId} failed: ${failedReason}`),
);
