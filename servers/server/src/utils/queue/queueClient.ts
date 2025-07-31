// import { BillQueue } from "@hi/db-models";
// import { Queue, QueueEvents } from "bullmq";
// import IORedis from "ioredis";

// class QueueClient {
//   private static instance: QueueClient;
//   public redisConnection: IORedis;
//   public billQueue: Queue;
//   public billQueueEvents: QueueEvents;

//   private constructor() {
//     this.redisConnection = new IORedis(
//       "redis://default:AzkxwkrnhjcsQGMdTz3AUk3tOxAsVC4I@redis-14878.c301.ap-south-1-1.ec2.redns.redis-cloud.com:14878",
//       { maxRetriesPerRequest: null },
//     );

//     this.billQueue = new Queue("billQueue", {
//       connection: this.redisConnection,
//       defaultJobOptions: {
//         attempts: 1,
//         backoff: { type: "fixed", delay: 0 },
//         removeOnComplete: { age: 50 },
//         removeOnFail: true,
//       },
//     });

//     this.billQueueEvents = new QueueEvents("billQueue", {
//       connection: this.redisConnection,
//     });

//     this.setupEventListeners();
//   }

//   private setupEventListeners() {
//     this.billQueueEvents.on("waiting", async ({ jobId }) => {
//       try {
//         await BillQueue.findOneAndUpdate(
//           { jobId },
//           { $set: { log: "waiting", jobId } },
//           { upsert: true, new: true },
//         );
//       } catch (err) {
//         console.error("Queue waiting error:", err);
//       }
//     });

//     this.billQueueEvents.on("active", async ({ jobId }) => {
//       await BillQueue.findOneAndUpdate({ jobId }, { log: "active" });
//     });

//     // Add other event listeners (completed, failed) here...
//   }

//   public static getInstance(): QueueClient {
//     if (!QueueClient.instance) {
//       QueueClient.instance = new QueueClient();
//     }
//     return QueueClient.instance;
//   }
// }

// // Initialize singleton instance
// export const queueClient = QueueClient.getInstance();
