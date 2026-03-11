import { Business, Payment } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import type { AnyPayment, BaseContext } from "../../utils/reportHelper/types";
import { buildConsolidatedData } from "../../utils/reportHelper/cansolidateReport";
import { respond } from "../../utils/response";

const bodySchema = z.object({
  businessIds: z.array(z.string()).min(1),
  from: z.number(),
  to: z.number(),
});

const consolidateRouter = new Hono().post(
  "/",
  zValidator("json", bodySchema),
  async (c) => {
    const { businessIds, from, to } = await c.req.json();

    if (from > to) {
      return c.json(
        { err: true, data: null, message: "`from` must be ≤ `to`" },
        400,
      );
    }

    const allPayments = (await Payment.find({
      businessId: { $in: businessIds },
      isDeleted: false,
      date: { $gte: from, $lte: to },
    }).lean()) as AnyPayment[];

    const bizDocs = await Business.find({ _id: { $in: businessIds } })
      .lean()
      .select({ name: 1 });

    const bizNameMap: Record<string, string> = {};
    for (const b of bizDocs) {
      bizNameMap[b._id.toString()] = b.name;
    }

    const ctx: BaseContext = {
      businessIds,
      from,
      to,
      allPayments,
      bizNameMap,
    };

    const data = await buildConsolidatedData(ctx);
    return respond(
      c,
      "Consolidated report fetched successfully",
      false,
      200,
      data,
    );
  },
);

export default consolidateRouter;
