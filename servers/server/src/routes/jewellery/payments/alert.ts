import { PaymentAlert } from "@hi/db-models";
import { paramsSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "../../../utils/response";
import { endOfToday, startOfToday } from "../../payments";
//
const alertRouter = new Hono()

  .get(
    "/waiter",

    zValidator("query", z.object({ businessId: z.string() })),

    async (c) => {
      const { businessId } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType: ["WAITER"],
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate({
          path: "order_id",
        })
        .populate({
          path: "userId",
          select: "name phone",
        });

      return respond(
        c,
        "existing paymentAlert",
        false,
        200,
        existingPaymentAlerts,
      );
    },
  )
  .get(
    "/",
    zValidator("query", z.object({ businessId: z.string().min(24).max(24) })),

    async (c) => {
      const { businessId } = c.req.query();

      const existingPaymentAlerts = await PaymentAlert.find({
        businessId,
        alertType: {
          $in: ["ONLINE", "NORMAL_SETTLE", "OFFLINE"],
        },
        isAccepted: false,
      })
        .sort({ _id: -1 })
        .populate({
          path: "order_id",
        })
        .populate({
          path: "userId",
          select: "name phone",
        });

      return respond(
        c,
        "existing paymentAlert",
        false,
        200,
        existingPaymentAlerts,
      );
    },
  )
  .get(
    "/history",

    zValidator("query", paramsSchema),

    async (c) => {
      const { businessId, from, to } = c.req.query();
      const fromDate = Number(from);
      const toDate = Number(to);
      const PAGE_SIZE = 20;
      const pageNumber = c.req.query("pageNumber") as string;
      const skip: number = (Number(pageNumber) - 1) * PAGE_SIZE;
      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }
      if (!from && !to) {
        const existingPaymentAlerts = await PaymentAlert.find({
          businessId,
          isAccepted: true,
          isRejected: false,
          date: {
            $gte: startOfToday.getTime(),
            $lte: endOfToday.getTime(),
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "order_id",
          })
          .populate({
            path: "userId",
            select: "name phone",
          });

        return c.json({
          data: existingPaymentAlerts,
          status: 200,
          err: false,
        });
      }

      if (from && to) {
        const existingPaymentAlerts = await PaymentAlert.find({
          businessId,
          isAccepted: true,
          isRejected: false,
          date: {
            $gte: fromDate,
            $lte: toDate,
          },
        })
          .sort({ _id: -1 })
          .skip(skip)
          .limit(PAGE_SIZE)
          .populate({
            path: "order_id",
          })
          .populate({
            path: "userId",
            select: "name phone",
          });

        return c.json({
          data: existingPaymentAlerts,
          status: 200,
          err: false,
        });
      }
      return c.json({
        err: true,
        data: {},
        message: "Invalid date range",
      });
    },
  );

export default alertRouter;
