// src/queueClient.ts
import { BillQueue } from "@hi/db-models";
import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

export const redisConnection = new IORedis(
  "redis://default:AzkxwkrnhjcsQGMdTz3AUk3tOxAsVC4I@redis-14878.c301.ap-south-1-1.ec2.redns.redis-cloud.com:14878",
  {
    maxRetriesPerRequest: null,
  },
);

export const billQueue = new Queue("billQueue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 1,
    backoff: { type: "fixed", delay: 0 },
    removeOnComplete: { age: 50 },
    removeOnFail: true,
  },
});

export const billQueueEvents = new QueueEvents("billQueue", {
  connection: redisConnection,
});

billQueueEvents.on("waiting", async ({ jobId }) => {
  try {
    await BillQueue.findOneAndUpdate(
      { jobId },
      { $set: { log: "waiting", jobId } },
      { upsert: true, new: true },
    );
  } catch (err) {}
});

billQueueEvents.on("active", async ({ jobId }) => {
  await BillQueue.findOneAndUpdate({ jobId }, { log: "active" });
});
billQueueEvents.on("completed", async ({ jobId }) => {
  await BillQueue.findOneAndUpdate({ jobId }, { log: "completed" });
});
billQueueEvents.on("failed", async ({ jobId, failedReason }) => {
  await BillQueue.findOneAndUpdate(
    { jobId },
    {
      log: failedReason,
    },
  );
});
