import type { Job } from "bullmq";

async function requestOnly(job: Job) {
  console.log("Requesting bill for orderId:", job.data.payload?.orderId);
}

async function requestAndSettle(job: Job) {
  console.log("Settling bill for:", job.data.saveOrderData?.total);
}

export const billHandlers = {
  requestOnly,
  requestAndSettle,
};
