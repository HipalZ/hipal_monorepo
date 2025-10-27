import { KotOrder } from "@hi/db-models";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../utils/response";
import { endOfToday, startOfToday } from "../payments";
const kdsRouter = new Hono()
  .get(
    "/kot/:kitchenId",
    zValidator("param", z.object({ kitchenId: z.string().min(24).max(24) })),
    async (c) => {
      const { kitchenId } = c.req.param();

      const kots = await KotOrder.find({
        accepted: true,
        settled: false,
        kotStatus: "IN_PROGRESS",
        "cart.dish.kitchenId": kitchenId,
      })
        .sort({ priority: -1, date: -1 })
        .lean();

      const filteredKots = kots.map((kot) => ({
        ...kot,
        cart: kot.cart.filter(
          (item) => item?.dish?.kitchenId?.toString() === kitchenId,
        ),
      }));

      return respond(c, "fetched successfully", false, 200, filteredKots);
    },
  )
  .get(
    "/kot/:businessId/history",
    zValidator("param", z.object({ businessId: z.string().min(24).max(24) })),
    zValidator(
      "query",
      z.object({
        kitchenId: z.string().min(24).max(24),
        from: z.string().max(30).optional(),
        to: z.string().max(30).optional(),
      }),
    ),

    async (c) => {
      const { businessId } = c.req.param();
      const { kitchenId, from, to } = c.req.query();
      const fromDate = from ? Number(from) : startOfToday.getTime();
      const toDate = to ? Number(to) : endOfToday.getTime();
      if (fromDate > toDate) {
        return respond(
          c,
          "from date should be less than to date",
          true,
          400,
          {},
        );
      }

      const kots = await KotOrder.find({
        accepted: true,
        settled: false,
        businessId: businessId,
        kotStatus: "COMPLETED",
        "cart.dish.kitchenId": kitchenId,
        date: {
          $gte: fromDate,
          $lte: toDate,
        },
      })
        .lean()
        .sort({ date: -1 });

      const filteredKots = kots.map((kot) => ({
        ...kot,
        cart: kot.cart.filter(
          (item) => item?.dish?.kitchenId?.toString() === kitchenId,
        ),
      }));

      return respond(c, "fetched successfully", false, 200, filteredKots);
    },
  );

export default kdsRouter;
