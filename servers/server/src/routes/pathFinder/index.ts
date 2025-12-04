import { Payment } from "@hi/db-models";
import { runInTransaction } from "@hi/utils";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  dateToTimestamp,
  transformToIntegraFormat,
} from "../../utils/pathfinder";
import { respond } from "../../utils/response";

const pathFinderRouter = new Hono().get(
  "/txns",
  zValidator(
    "query",
    z.object({
      businessId: z.string().min(1).max(24),
      from: z.string().min(1).max(50),
      to: z.string().min(1).max(50),
      pageNumber: z.string().optional().default("1"),
    }),
  ),
  async (c) => {
    //@ts-ignore
    return runInTransaction(async (session) => {
      const { businessId, from, to , pageNumber} = c.req.query();

      const fromDate = dateToTimestamp(from);
      const toDate = dateToTimestamp(to);
      const page = Number(pageNumber) || 1;
      const pageSize = 40; // You can adjust the page size as needed
      const skip = (page - 1) * pageSize;

      const payments = await Payment.find({
        businessId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      }).sort({ billInvoice: 1 }).skip(skip).limit(pageSize);

      const data = await transformToIntegraFormat(payments);

      return respond(c, "fetched successfully", false, 200, data);
    });
  },
);

export default pathFinderRouter;
