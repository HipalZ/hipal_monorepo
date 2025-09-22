import { JewelleryPayment } from "@hi/db-models";
import { paramsSchema } from "@hi/db-models/src/validators";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { adjustFromToTimestamps } from "../../../utils/defaultBillingTime";
//

const dashboardRouter = new Hono()
  .get(
    "/summary",

    zValidator("query", paramsSchema),
    async (c) => {
      const { businessId, from, to } = c.req.query();

      // Adjust `from` and `to` timestamps based on whether they are today's date or not
      const { adjustedFrom, adjustedTo } = adjustFromToTimestamps(
        Number(from),
        Number(to),
      );

      // Use the adjusted timestamps as `fromDate` and `toDate`
      const fromDate = adjustedFrom;
      const toDate = adjustedTo;
      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const payments = await JewelleryPayment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      }).populate("orderId");

      const totalOrders = payments.length;

      let overAllAmount = 0;
      let totalOnlineSale = 0;
      const offlineSales: Record<string, number> = {};

      for (const payment of payments) {
        const { paymentMode, mode, splitModes } = payment;

        if (mode === "split" && Array.isArray(splitModes)) {
          let splitTotal = 0;

          for (const settle of splitModes) {
            if (settle.name !== "complementary") {
              splitTotal += settle.amount ?? 0;
              offlineSales[settle.name] =
                (offlineSales[settle.name] || 0) + (settle.amount ?? 0);
            }
          }

          overAllAmount += splitTotal; // Only add non-complementary split values
        } else if (!["dues", "npc", "complementary"].includes(mode)) {
          overAllAmount += payment.orderId.total; // Add total if it's not dues, npc, or complementary
        }

        if (paymentMode === "online") {
          totalOnlineSale += payment.orderId.total;
        } else if (!["dues", "npc", "complementary"].includes(paymentMode)) {
          offlineSales[mode] =
            (offlineSales[mode] || 0) + payment.orderId.total;
        }
      }

      delete offlineSales["complementary"];
      delete offlineSales["split"];

      return c.json({
        err: false,
        data: {
          overAllAmount, // Excludes complementary but includes cash in split modes
          onlineSale: { online: totalOnlineSale },
          offlineSale: offlineSales,
          totalOrders,
          totalActiveTableValue: 0, // Placeholder, implement if needed
        },
      });
    },
  )

  .get(
    "/other_and_warnings",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();

      // Adjust `from` and `to` timestamps based on whether they are today's date or not
      const { adjustedFrom, adjustedTo } = adjustFromToTimestamps(
        Number(from),
        Number(to),
      );

      // Use the adjusted timestamps as `fromDate` and `toDate`
      const fromDate = adjustedFrom;
      const toDate = adjustedTo;

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const payments = await JewelleryPayment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      }).populate("orderId");

      let totalTax = 0;
      let totalTip = 0;
      let totalServiceCharge = 0;

      for (const payment of payments) {
        if (payment.mode !== "dues") {
          totalTax += payment.orderId.tax ?? 0;
        }
        totalTip += payment.orderId.tips ?? 0;
        totalServiceCharge += payment.orderId.serviceCharge ?? 0;
      }

      return c.json({
        err: false,
        data: {
          otherSale: {
            totalTax: Math.round(totalTax),
            totalTip,
            totalServiceCharge: Math.round(totalServiceCharge),
          },
          warningSale: {},
        },
      });
    },
  )

  .get(
    "/exception_and_rewards",

    zValidator(
      "query",
      z.object({
        businessId: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }),
    ),
    async (c) => {
      const { businessId, from, to } = c.req.query();

      // Adjust `from` and `to` timestamps based on whether they are today's date or not
      const { adjustedFrom, adjustedTo } = adjustFromToTimestamps(
        Number(from),
        Number(to),
      );

      // Use the adjusted timestamps as `fromDate` and `toDate`
      const fromDate = adjustedFrom;
      const toDate = adjustedTo;

      if (fromDate > toDate) {
        return c.json({
          err: true,
          data: {},
          message: "from date should be less than to date",
        });
      }

      const payments = await JewelleryPayment.find({
        businessId,
        isDeleted: false,
        date: { $gte: fromDate, $lte: toDate },
      }).populate("orderId");

      let totalDiscount = 0;
      let totalDuesGiven = 0;
      let totalCouponDiscount = 0;
      let totalNpc = 0;
      let totalComplementary = 0;
      let totalCoinsGiven = 0;
      let totalCoinsUsed = 0;

      for (const payment of payments) {
        totalDiscount += payment.orderId.discount ?? 0;

        if (payment.mode === "dues") {
          totalDuesGiven += payment.orderId.total;
        }

        if (payment.mode === "npc") {
          totalNpc += payment.orderId.total;
        }

        if (payment.mode === "complementary") {
          totalComplementary += payment.orderId.total;
        }

        if (
          Array.isArray(payment.splitModes) &&
          payment.splitModes.length > 1
        ) {
          for (const split of payment.splitModes) {
            if (split.name === "complementary") {
              totalComplementary += split.amount ?? 0;
            }
          }
        }

        totalCoinsGiven += payment.earnCoins ?? 0;

        if (payment.orderId.claimedCoins && !payment.orderId.couponId) {
          totalCoinsUsed += payment.orderId.claimedCoins ?? 0;
        }

        if (payment.orderId.couponDiscount > 0) {
          totalCouponDiscount += payment.orderId.couponDiscount ?? 0;
        }
      }

      return c.json({
        err: false,
        data: {
          exceptionSale: {
            totalDuesGiven,
            totalNpc,
            totalComplementary,
            totalDiscount,
          },
          rewardSale: {
            totalCoinsGiven,
            totalCoinsUsed,
            totalCouponDiscount,
          },
        },
      });
    },
  );

export default dashboardRouter;
