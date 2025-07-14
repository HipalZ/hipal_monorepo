// src/queueClient.ts
import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
  host: "redis-14878.c301.ap-south-1-1.ec2.redns.redis-cloud.com",
  port: 14878,
  password: "AzkxwkrnhjcsQGMdTz3AUk3tOxAsVC4I",
  maxRetriesPerRequest: null,
});

export const billQueue = new Queue("billQueue", { connection });
